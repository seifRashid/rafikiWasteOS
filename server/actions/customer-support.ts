"use server";

import { z } from "zod";
import { db } from "@/server/db";
import { customerRequests, customerComplaints, clients } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/server";

export type ActionResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

// 1. Client Submitting a Service Request Schema
const SubmitRequestSchema = z.object({
  type: z.enum([
    "Extra Bulk Organic Collection",
    "Extra Recyclable Collection",
    "Additional Bins Request",
    "Bin Replacement / Repair",
    "Hazardous or Electronic Clearance",
    "Schedule Change Request",
    "Special Event Support",
    "Other Service Request",
  ]),
  subject: z.string().min(3, "Subject must be at least 3 characters").max(120),
  details: z.string().min(10, "Please provide detailed description (at least 10 characters)"),
  priority: z.enum(["low", "normal", "medium", "high", "urgent"]).default("normal"),
  preferredDate: z.string().optional().or(z.literal("")),
});

export async function submitCustomerRequestAction(
  rawInput: unknown
): Promise<ActionResponse<{ ticketNumber: string; id: string }>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Authentication required to submit requests." };
    }

    // Support both client users and admins testing from client portal
    let activeClientId = user.clientId;
    if (!activeClientId && user.isAdmin) {
      const [firstClient] = await db
        .select({ id: clients.id })
        .from(clients)
        .where(eq(clients.isDeleted, false))
        .limit(1);
      activeClientId = firstClient?.id;
    }

    if (!activeClientId) {
      return { success: false, error: "No client organization associated with account." };
    }

    // Verify client organization is active
    const [clientRecord] = await db
      .select({ id: clients.id, isActive: clients.isActive, isDeleted: clients.isDeleted })
      .from(clients)
      .where(eq(clients.id, activeClientId))
      .limit(1);

    if (!clientRecord || !clientRecord.isActive || clientRecord.isDeleted) {
      return {
        success: false,
        error: "Your client account is currently deactivated. Submissions are disabled. Please contact operations.",
      };
    }

    const parsed = SubmitRequestSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed. Please check form fields.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const { type, subject, details, priority, preferredDate } = parsed.data;

    // Generate ticket number: e.g. REQ-2026-XXXX
    const randomSeq = Math.floor(1000 + Math.random() * 9000);
    const year = new Date().getFullYear();
    const ticketNumber = `REQ-${year}-${randomSeq}`;

    const [newRequest] = await db
      .insert(customerRequests)
      .values({
        ticketNumber,
        clientId: activeClientId,
        type,
        subject,
        details,
        priority,
        status: "pending",
        preferredDate: preferredDate || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning({ id: customerRequests.id, ticketNumber: customerRequests.ticketNumber });

    revalidatePath("/portal/requests");
    revalidatePath("/customers/requests");
    revalidatePath("/portal");

    return {
      success: true,
      data: { ticketNumber: newRequest.ticketNumber, id: newRequest.id },
    };
  } catch (error) {
    console.error("[submitCustomerRequestAction Error]:", error);
    return { success: false, error: "Failed to submit service request. Please try again." };
  }
}

// 2. Client Submitting a Complaint / Service Issue Schema
const SubmitComplaintSchema = z.object({
  category: z.enum([
    "Missed Collection",
    "Damaged Container / Caster",
    "Spill / Littering at Site",
    "Late Arrival / Timing Window",
    "Driver / Crew Conduct",
    "Billing / Invoice Discrepancy",
    "Weighbridge Discrepancy",
    "Other Service Failure",
  ]),
  subject: z.string().min(3, "Subject must be at least 3 characters").max(120),
  description: z.string().min(10, "Please provide description of the incident (at least 10 characters)"),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
});

export async function submitCustomerComplaintAction(
  rawInput: unknown
): Promise<ActionResponse<{ ticketNumber: string; id: string }>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Authentication required to log complaints." };
    }

    let activeClientId = user.clientId;
    if (!activeClientId && user.isAdmin) {
      const [firstClient] = await db
        .select({ id: clients.id })
        .from(clients)
        .where(eq(clients.isDeleted, false))
        .limit(1);
      activeClientId = firstClient?.id;
    }

    if (!activeClientId) {
      return { success: false, error: "No client organization associated with account." };
    }

    // Verify client organization is active
    const [clientRecord] = await db
      .select({ id: clients.id, isActive: clients.isActive, isDeleted: clients.isDeleted })
      .from(clients)
      .where(eq(clients.id, activeClientId))
      .limit(1);

    if (!clientRecord || !clientRecord.isActive || clientRecord.isDeleted) {
      return {
        success: false,
        error: "Your client account is currently deactivated. Submissions are disabled. Please contact operations.",
      };
    }

    const parsed = SubmitComplaintSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed. Please check form fields.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const { category, subject, description, priority } = parsed.data;

    // Generate ticket number: e.g. CMP-2026-XXXX
    const randomSeq = Math.floor(100 + Math.random() * 900);
    const year = new Date().getFullYear();
    const ticketNumber = `CMP-${year}-${randomSeq}`;

    const [newComplaint] = await db
      .insert(customerComplaints)
      .values({
        ticketNumber,
        clientId: activeClientId,
        category,
        subject,
        description,
        priority,
        status: "open",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning({ id: customerComplaints.id, ticketNumber: customerComplaints.ticketNumber });

    revalidatePath("/portal/complaints");
    revalidatePath("/customers/complaints");
    revalidatePath("/portal");

    return {
      success: true,
      data: { ticketNumber: newComplaint.ticketNumber, id: newComplaint.id },
    };
  } catch (error) {
    console.error("[submitCustomerComplaintAction Error]:", error);
    return { success: false, error: "Failed to log complaint. Please try again." };
  }
}

// 3. Admin Action: Update Request Status
export async function updateCustomerRequestStatusAction(
  requestId: string,
  status: "pending" | "assigned" | "in_progress" | "completed" | "rejected",
  adminNotes?: string
): Promise<ActionResponse> {
  try {
    const user = await getCurrentUser();
    if (!user || (!user.isAdmin && user.role !== "operations_manager" && user.role !== "super_admin")) {
      return { success: false, error: "Unauthorized: Administrator permissions required." };
    }

    await db
      .update(customerRequests)
      .set({
        status,
        adminNotes: adminNotes || null,
        updatedAt: new Date(),
      })
      .where(eq(customerRequests.id, requestId));

    revalidatePath("/customers/requests");
    revalidatePath("/portal/requests");

    return { success: true };
  } catch (error) {
    console.error("[updateCustomerRequestStatusAction Error]:", error);
    return { success: false, error: "Failed to update request status." };
  }
}

// 4. Admin Action: Update Complaint Status
export async function updateCustomerComplaintStatusAction(
  complaintId: string,
  status: "open" | "in_progress" | "resolved" | "dismissed",
  assignedTo?: string,
  resolutionNotes?: string
): Promise<ActionResponse> {
  try {
    const user = await getCurrentUser();
    if (!user || (!user.isAdmin && user.role !== "operations_manager" && user.role !== "super_admin")) {
      return { success: false, error: "Unauthorized: Administrator permissions required." };
    }

    await db
      .update(customerComplaints)
      .set({
        status,
        assignedTo: assignedTo || null,
        resolutionNotes: resolutionNotes || null,
        updatedAt: new Date(),
      })
      .where(eq(customerComplaints.id, complaintId));

    revalidatePath("/customers/complaints");
    revalidatePath("/portal/complaints");

    return { success: true };
  } catch (error) {
    console.error("[updateCustomerComplaintStatusAction Error]:", error);
    return { success: false, error: "Failed to update complaint status." };
  }
}
