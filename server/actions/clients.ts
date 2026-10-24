"use server";

import { z } from "zod";
import { db } from "@/server/db";
import { clients, customerTypeEnum, collectionFrequencyEnum, users, collectionJobs } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { syncDateOperations } from "./routes";
import { getDerivedFrequencyEnum } from "@/lib/schedule-utils";

import { deactivateExpiredContractsService } from "@/server/services/contract-expiration";

const CreateClientSchema = z
  .object({
    name: z.string().min(2, "Client name is required"),
    customerType: z.enum([
      "household",
      "apartment",
      "hotel",
      "restaurant",
      "business",
      "school",
      "institution",
      "government",
    ]),
    contactPerson: z.string().optional(),
    email: z.string().email("Invalid email address").optional().or(z.literal("")),
    phone: z.string().min(6, "Valid phone number is required"),
    physicalAddress: z.string().min(3, "Physical address is required"),
    countyRegion: z.string().min(2, "County/Region is required"),
    collectionFrequency: z
      .enum(["daily", "twice_weekly", "weekly", "bi_weekly", "monthly", "on_demand"])
      .optional(),
    collectionDays: z.string().optional(),
    wasteStreams: z.string().default("Organic, Recyclable"),
    binCount: z.string().default("2 x 240L Bins"),
    monthlyFee: z.number().nonnegative().default(0),
    currency: z.string().default("KES"),
    contractStartDate: z.string().optional().or(z.literal("")),
    contractEndDate: z.string().optional().or(z.literal("")),
    notes: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.contractStartDate && data.contractEndDate) {
        return new Date(data.contractEndDate) >= new Date(data.contractStartDate);
      }
      return true;
    },
    {
      message: "Contract end date cannot be earlier than start date",
      path: ["contractEndDate"],
    }
  );

export type ActionResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function createClientAction(rawInput: unknown): Promise<ActionResponse> {
  try {
    const parsed = CreateClientSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed. Please review the highlighted fields.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const {
      name,
      customerType,
      contactPerson,
      email,
      phone,
      physicalAddress,
      countyRegion,
      collectionFrequency,
      collectionDays,
      wasteStreams,
      binCount,
      monthlyFee,
      currency,
      contractStartDate,
      contractEndDate,
      notes,
    } = parsed.data;

    // Generate unique account number
    const prefix = customerType.substring(0, 3).toUpperCase();
    const randomSeq = Math.floor(100 + Math.random() * 900);
    const accountNumber = `CLT-${prefix}-${randomSeq}`;

    const derivedFrequency = collectionFrequency || getDerivedFrequencyEnum(collectionDays);

    // Check if contract has already expired upon entry
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    const isExpired = Boolean(contractEndDate && contractEndDate < todayStr);
    const isActive = !isExpired;

    const initialNotes = isExpired
      ? notes
        ? `${notes} [Auto-deactivated: Contract expired on ${contractEndDate}]`
        : `[Auto-deactivated: Contract expired on ${contractEndDate}]`
      : notes || null;

    const [newClient] = await db
      .insert(clients)
      .values({
        accountNumber,
        name,
        customerType,
        contactPerson: contactPerson || null,
        email: email || null,
        phone,
        physicalAddress,
        countyRegion,
        collectionFrequency: derivedFrequency,
        collectionDays: collectionDays || null,
        wasteStreams,
        binCount,
        monthlyFee: monthlyFee.toFixed(2),
        currency,
        contractStartDate: contractStartDate || null,
        contractEndDate: contractEndDate || null,
        notes: initialNotes,
        isActive,
      })
      .returning();

    revalidatePath("/clients");
    revalidatePath("/operations/schedule");
    revalidatePath("/");

    return { success: true, data: newClient };
  } catch (error) {
    console.error("[ACTION_ERROR: createClientAction]", error);
    return { success: false, error: "Failed to create client profile. Please try again." };
  }
}

export async function triggerExpiredContractsCheckAction(): Promise<ActionResponse<{ deactivatedCount: number }>> {
  try {
    const res = await deactivateExpiredContractsService();
    return { success: true, data: { deactivatedCount: res.deactivatedCount } };
  } catch (e) {
    console.error("[triggerExpiredContractsCheckAction Error]:", e);
    return { success: false, error: "Failed to check expired contracts." };
  }
}

const ClientIdSchema = z.string().min(1, "Client ID is required");

export async function toggleClientStatusAction(
  rawClientId: unknown,
  rawIsActive: unknown
): Promise<ActionResponse<{ isActive: boolean }>> {
  try {
    const clientIdResult = ClientIdSchema.safeParse(rawClientId);
    if (!clientIdResult.success) {
      return { success: false, error: "Invalid client ID provided." };
    }
    const isActive = Boolean(rawIsActive);
    const clientId = clientIdResult.data;

    // Verify client exists and is not soft-deleted
    const [existingClient] = await db
      .select()
      .from(clients)
      .where(and(eq(clients.id, clientId), eq(clients.isDeleted, false)))
      .limit(1);

    if (!existingClient) {
      return { success: false, error: "Client not found or already deleted." };
    }

    // 1. Update client status in clients table
    await db
      .update(clients)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(clients.id, clientId));

    // 2. Synchronize associated client portal user logins (safe non-blocking)
    try {
      await db
        .update(users)
        .set({ status: isActive ? "active" : "inactive", updatedAt: new Date() })
        .where(and(eq(users.clientId, clientId), eq(users.isDeleted, false)));
    } catch (userErr) {
      console.warn("[toggleClientStatusAction] User sync notice:", userErr);
    }

    try {
      await syncDateOperations("2026-10-14");
    } catch (e) {
      console.warn("[toggleClientStatusAction] syncDateOperations fallback:", e);
    }

    revalidatePath("/clients");
    revalidatePath("/operations/schedule");
    revalidatePath("/operations/routes");
    revalidatePath("/routes");
    revalidatePath(`/clients/${clientId}`);
    revalidatePath("/");

    return { success: true, data: { isActive } };
  } catch (error) {
    console.error("[ACTION_ERROR: toggleClientStatusAction]", error);
    const msg = error instanceof Error ? error.message : "Failed to update client status. Please try again.";
    return { success: false, error: msg };
  }
}

export async function deleteClientAction(rawClientId: unknown): Promise<ActionResponse> {
  try {
    const clientIdResult = ClientIdSchema.safeParse(rawClientId);
    if (!clientIdResult.success) {
      return { success: false, error: "Invalid client ID provided." };
    }
    const clientId = clientIdResult.data;

    // Verify client exists and is not already deleted
    const [existingClient] = await db
      .select()
      .from(clients)
      .where(and(eq(clients.id, clientId), eq(clients.isDeleted, false)))
      .limit(1);

    if (!existingClient) {
      return { success: false, error: "Client account not found or has already been removed." };
    }

    const now = new Date();

    // 1. Mark client as soft-deleted and inactive
    await db
      .update(clients)
      .set({
        isDeleted: true,
        deletedAt: now,
        isActive: false,
        updatedAt: now,
      })
      .where(eq(clients.id, clientId));

    // 2. Revoke and soft-delete associated client portal user logins (safe non-blocking)
    try {
      await db
        .update(users)
        .set({
          isDeleted: true,
          status: "inactive",
          updatedAt: now,
        })
        .where(eq(users.clientId, clientId));
    } catch (userErr) {
      console.warn("[deleteClientAction] User sync notice:", userErr);
    }

    // 3. Cancel only future scheduled jobs that have not been collected or delivered.
    // COMPLETED, DELIVERED, and COLLECTED jobs are strictly preserved to maintain
    // accurate weighbridge records, historical weight tickets, diversion math, and ESG audits!
    try {
      await db
        .update(collectionJobs)
        .set({
          status: "missed",
          missedReason: "other",
          notes: "[Cancelled: Client account deleted/terminated]",
          updatedAt: now,
        })
        .where(
          and(
            eq(collectionJobs.clientId, clientId),
            eq(collectionJobs.isDeleted, false),
            eq(collectionJobs.status, "scheduled")
          )
        );
    } catch (jobErr) {
      console.warn("[deleteClientAction] Jobs cancel notice:", jobErr);
    }

    try {
      await syncDateOperations("2026-10-14");
    } catch (e) {
      console.warn("[deleteClientAction] syncDateOperations fallback:", e);
    }

    revalidatePath("/clients");
    revalidatePath("/operations/schedule");
    revalidatePath("/operations/routes");
    revalidatePath("/routes");
    revalidatePath(`/clients/${clientId}`);
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("[ACTION_ERROR: deleteClientAction]", error);
    return { success: false, error: "Failed to delete client account. Please try again." };
  }
}

export async function updateClientScheduleAction(
  clientId: string,
  collectionDays: string,
  collectionFrequency?: "daily" | "twice_weekly" | "weekly" | "bi_weekly" | "monthly" | "on_demand"
): Promise<ActionResponse> {
  try {
    const derivedFrequency = collectionFrequency || getDerivedFrequencyEnum(collectionDays);

    const updateData = {
      collectionDays,
      collectionFrequency: derivedFrequency,
      updatedAt: new Date(),
    };

    await db
      .update(clients)
      .set(updateData)
      .where(eq(clients.id, clientId));

    try {
      await syncDateOperations("2026-10-14");
    } catch (e) {
      console.warn("[updateClientScheduleAction] syncDateOperations fallback:", e);
    }

    revalidatePath("/operations/schedule");
    revalidatePath("/operations/routes");
    revalidatePath("/routes");
    revalidatePath("/clients");
    revalidatePath(`/clients/${clientId}`);
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("[ACTION_ERROR: updateClientScheduleAction]", error);
    return { success: false, error: "Failed to update client collection schedule." };
  }
}
