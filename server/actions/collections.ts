"use server";

import { z } from "zod";
import { db } from "@/server/db";
import { collectionJobs, jobStatusEnum, missedReasonEnum } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const RecordWeightSchema = z.object({
  jobId: z.string().uuid(),
  grossWeightKg: z.number().positive("Gross weight must be positive"),
  tareWeightKg: z.number().nonnegative("Tare weight cannot be negative"),
  ticketPhotoUrl: z.string().optional(),
  notes: z.string().optional(),
});

const UpdateStatusSchema = z.object({
  jobId: z.string().uuid(),
  status: z.enum([
    "scheduled",
    "assigned",
    "in_progress",
    "collected",
    "delivered",
    "completed",
    "missed",
  ]),
  notes: z.string().optional(),
  proofPhotoUrl: z.string().optional(),
  actualWeightKg: z.number().optional(),
});

const ReportMissedSchema = z.object({
  jobId: z.string().uuid(),
  missedReason: z.enum([
    "gate_locked",
    "access_blocked",
    "bin_empty",
    "client_not_ready",
    "severe_weather",
    "vehicle_breakdown",
    "other",
  ]),
  notes: z.string().min(3, "Please provide a brief reason or note for the missed stop"),
});

export async function recordCollectionWeightAction(rawInput: unknown) {
  try {
    const parsed = RecordWeightSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const { jobId, grossWeightKg, tareWeightKg, ticketPhotoUrl, notes } = parsed.data;
    const netWeightKg = grossWeightKg - tareWeightKg;
    if (netWeightKg <= 0) {
      return { success: false, error: "Gross weight must be greater than tare weight." };
    }

    await db
      .update(collectionJobs)
      .set({
        grossWeightKg: grossWeightKg.toFixed(2),
        tareWeightKg: tareWeightKg.toFixed(2),
        actualWeightKg: netWeightKg.toFixed(2),
        status: "delivered",
        deliveredAt: new Date(),
        ticketPhotoUrl: ticketPhotoUrl || null,
        notes: notes ? notes : undefined,
        updatedAt: new Date(),
      })
      .where(eq(collectionJobs.id, jobId));

    revalidatePath("/collections");
    revalidatePath("/inventory");
    revalidatePath("/impact");
    revalidatePath("/");

    return { success: true, netWeightKg };
  } catch (error) {
    console.error("[ACTION_ERROR: recordCollectionWeightAction]", error);
    return { success: false, error: "Failed to record weighbridge ticket." };
  }
}

export async function updateJobStatusAction(rawInput: unknown) {
  try {
    const parsed = UpdateStatusSchema.safeParse(rawInput);
    if (!parsed.success) {
      return { success: false, error: "Invalid status update payload" };
    }

    const { jobId, status, notes, proofPhotoUrl, actualWeightKg } = parsed.data;

    const updatePayload: Record<string, unknown> = {
      status,
      updatedAt: new Date(),
    };

    if (status === "collected") {
      updatePayload.collectedAt = new Date();
    } else if (status === "delivered" || status === "completed") {
      updatePayload.deliveredAt = new Date();
    }

    if (notes) updatePayload.notes = notes;
    if (proofPhotoUrl) updatePayload.proofPhotoUrl = proofPhotoUrl;
    if (actualWeightKg !== undefined) {
      updatePayload.actualWeightKg = actualWeightKg.toFixed(2);
    }

    await db.update(collectionJobs).set(updatePayload).where(eq(collectionJobs.id, jobId));

    revalidatePath("/collections");
    revalidatePath("/routes");
    revalidatePath("/field");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("[ACTION_ERROR: updateJobStatusAction]", error);
    return { success: false, error: "Failed to update job status." };
  }
}

export async function reportMissedJobAction(rawInput: unknown) {
  try {
    const parsed = ReportMissedSchema.safeParse(rawInput);
    if (!parsed.success) {
      return { success: false, error: "Invalid missed stop report" };
    }

    const { jobId, missedReason, notes } = parsed.data;

    await db
      .update(collectionJobs)
      .set({
        status: "missed",
        missedReason,
        notes: `[MISSED: ${missedReason.replace("_", " ").toUpperCase()}] ${notes}`,
        updatedAt: new Date(),
      })
      .where(eq(collectionJobs.id, jobId));

    revalidatePath("/collections");
    revalidatePath("/routes");
    revalidatePath("/field");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("[ACTION_ERROR: reportMissedJobAction]", error);
    return { success: false, error: "Failed to log missed collection." };
  }
}

export async function createJobAction(rawInput: {
  clientId: string;
  wasteStream: "organic" | "recyclable" | "residual" | "hazardous" | "electronic";
  expectedQuantityKg: number;
  scheduledAt: string;
  notes?: string;
}) {
  try {
    const randomSeq = Math.floor(1000 + Math.random() * 9000);
    const jobNumber = `JOB-2026-${randomSeq}`;

    const [newJob] = await db
      .insert(collectionJobs)
      .values({
        jobNumber,
        clientId: rawInput.clientId,
        wasteStream: rawInput.wasteStream,
        expectedQuantityKg: rawInput.expectedQuantityKg.toFixed(2),
        scheduledAt: new Date(rawInput.scheduledAt),
        status: "scheduled",
        notes: rawInput.notes || null,
      })
      .returning();

    revalidatePath("/collections");
    revalidatePath("/routes");
    revalidatePath("/");

    return { success: true, data: newJob };
  } catch (error) {
    console.error("[ACTION_ERROR: createJobAction]", error);
    return { success: false, error: "Failed to create collection job." };
  }
}
