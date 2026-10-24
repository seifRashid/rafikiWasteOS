"use server";

import { z } from "zod";
import { db } from "@/server/db";
import { clients, users, collectionJobs } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/server";

// 1. Client updating their own contact profile
const UpdateClientProfileSchema = z.object({
  contactPerson: z.string().min(2, "Contact person name is required"),
  phone: z.string().min(6, "Valid phone number is required"),
  email: z.string().email("Valid email is required"),
  notes: z.string().optional(),
});

export type ActionResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function updateClientProfileSelfAction(
  rawInput: unknown
): Promise<ActionResponse> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !currentUser.isClient || !currentUser.clientId || currentUser.isClientActive === false) {
      return { success: false, error: "Unauthorized access: Client account is deactivated or inactive." };
    }

    const parsed = UpdateClientProfileSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: "Validation error. Please verify input fields.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const { contactPerson, phone, email, notes } = parsed.data;

    await db
      .update(clients)
      .set({
        contactPerson,
        phone,
        email,
        notes: notes || null,
        updatedAt: new Date(),
      })
      .where(eq(clients.id, currentUser.clientId));

    revalidatePath("/portal");
    revalidatePath("/portal/profile");

    return { success: true };
  } catch (error) {
    console.error("[updateClientProfileSelfAction Error]:", error);
    return { success: false, error: "Failed to update profile. Please try again." };
  }
}

// 2. Provisioning Client Portal Access from Internal CRM
const ProvisionClientUserSchema = z.object({
  clientId: z.string().uuid("Invalid client identifier"),
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(6, "Valid phone number is required"),
  role: z.enum(["client_admin", "client_user"]).default("client_admin"),
  tempPassword: z.string().min(8, "Password must be at least 8 characters").default("RafikiDemo2026!"),
});

export async function provisionClientUserAction(
  rawInput: unknown
): Promise<ActionResponse<{ email: string; role: string }>> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.isClient || (!currentUser.isAdmin && currentUser.role !== "operations_manager")) {
      return { success: false, error: "Only internal administrators or operations managers can provision client accounts." };
    }

    const parsed = ProvisionClientUserSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed. Check form fields.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const { clientId, fullName, email, phone, role, tempPassword } = parsed.data;

    // Verify client exists
    const [clientRecord] = await db
      .select()
      .from(clients)
      .where(and(eq(clients.id, clientId), eq(clients.isDeleted, false)))
      .limit(1);

    if (!clientRecord) {
      return { success: false, error: "Client organization not found." };
    }

    // 1. Create account in Neon Auth
    let authUserId: string | null = null;
    const authBaseUrl = process.env.NEON_AUTH_BASE_URL;

    if (authBaseUrl) {
      try {
        const res = await fetch(`${authBaseUrl}/sign-up/email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Origin: "http://localhost:3000",
          },
          body: JSON.stringify({
            email,
            password: tempPassword,
            name: fullName,
          }),
        });

        const data = await res.json().catch(() => null);
        if (res.ok && data?.user?.id) {
          authUserId = data.user.id;
        }
      } catch (authErr) {
        console.warn("Neon Auth auto-provision notice:", authErr);
      }
    }

    // 2. Upsert in domain users table
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(users)
        .set({
          clientId,
          fullName,
          phone,
          role,
          roleTitle: role === "client_admin" ? "Client Portal Admin" : "Client Portal User",
          status: "active",
          updatedAt: new Date(),
        })
        .where(eq(users.id, existing[0].id));
    } else {
      await db.insert(users).values({
        authUserId,
        clientId,
        fullName,
        email,
        phone,
        role,
        roleTitle: role === "client_admin" ? "Client Portal Admin" : "Client Portal User",
        status: "active",
        depotLocation: clientRecord.physicalAddress,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    revalidatePath(`/clients/${clientId}`);
    revalidatePath("/clients");

    return {
      success: true,
      data: { email, role },
    };
  } catch (error) {
    console.error("[provisionClientUserAction Error]:", error);
    return { success: false, error: "Failed to provision client portal user." };
  }
}

// 3. Client booking an on-demand / extra collection run
const RequestExtraPickupSchema = z.object({
  pickupDate: z.string().min(10, "Pickup date is required"), // YYYY-MM-DD
  timeSlot: z.enum(["morning", "midday", "afternoon"]).default("morning"),
  wasteStream: z.enum(["organic", "recyclable", "residual", "hazardous", "electronic"]),
  expectedQuantityKg: z.number().positive("Estimated weight must be greater than 0").default(250),
  notes: z.string().optional(),
});

export async function requestExtraPickupAction(
  rawInput: unknown
): Promise<ActionResponse<{ jobNumber: string; scheduledAt: string }>> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !currentUser.isClient || !currentUser.clientId) {
      // Allow super_admin testing as well
      if (!currentUser?.isAdmin && !currentUser?.clientId) {
        return { success: false, error: "Unauthorized: Active client credentials required." };
      }
    }

    let activeClientId = currentUser?.clientId;
    if (!activeClientId && currentUser?.isAdmin) {
      const [firstClient] = await db
        .select()
        .from(clients)
        .where(eq(clients.isDeleted, false))
        .limit(1);
      activeClientId = firstClient?.id;
    }

    if (!activeClientId) {
      return { success: false, error: "No client organization associated with account." };
    }

    // Verify client organization is active and not deleted
    const [clientRecord] = await db
      .select({ id: clients.id, isActive: clients.isActive, isDeleted: clients.isDeleted })
      .from(clients)
      .where(eq(clients.id, activeClientId))
      .limit(1);

    if (!clientRecord || !clientRecord.isActive || clientRecord.isDeleted) {
      return {
        success: false,
        error: "Your client account is currently deactivated. Collection pickup requests are disabled. Please contact support.",
      };
    }

    const parsed = RequestExtraPickupSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed. Please verify requested date and stream.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const { pickupDate, timeSlot, wasteStream, expectedQuantityKg, notes } = parsed.data;

    // Build scheduled date and time
    let timeStr = "08:00:00";
    if (timeSlot === "midday") timeStr = "12:30:00";
    if (timeSlot === "afternoon") timeStr = "15:30:00";

    const scheduledDateObj = new Date(`${pickupDate}T${timeStr}`);
    if (isNaN(scheduledDateObj.getTime())) {
      return { success: false, error: "Invalid date format specified." };
    }

    // Generate unique job number
    const randSeq = Math.floor(1000 + Math.random() * 9000);
    const jobNumber = `JOB-REQ-${randSeq}`;

    const [newJob] = await db
      .insert(collectionJobs)
      .values({
        jobNumber,
        clientId: activeClientId,
        wasteStream,
        expectedQuantityKg: expectedQuantityKg.toFixed(2),
        scheduledAt: scheduledDateObj,
        status: "scheduled",
        binCondition: "Normal",
        notes: notes ? `[On-Demand Request] ${notes.trim()}` : "[On-Demand Client Request]",
      })
      .returning();

    // Revalidate customer & operational dashboards
    revalidatePath("/portal");
    revalidatePath("/portal/schedule");
    revalidatePath("/portal/collections");
    revalidatePath("/operations/schedule");
    revalidatePath("/operations/collections");
    revalidatePath("/operations/routes");
    revalidatePath("/customers/requests");

    return {
      success: true,
      data: {
        jobNumber: newJob.jobNumber,
        scheduledAt: newJob.scheduledAt.toISOString(),
      },
    };
  } catch (error) {
    console.error("[requestExtraPickupAction Error]:", error);
    return { success: false, error: "Failed to schedule collection request. Please try again." };
  }
}

