"use server";

import { z } from "zod";
import { db } from "@/server/db";
import { clients, users } from "@/server/db/schema";
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
    if (!currentUser || !currentUser.isClient || !currentUser.clientId) {
      return { success: false, error: "Unauthorized access to client profile." };
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
