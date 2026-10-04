"use server";

import { z } from "zod";
import { db } from "@/server/db";
import { vehicles, vehicleStatusEnum } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const UpdateMileageSchema = z.object({
  vehicleId: z.string().uuid(),
  currentMileageKm: z.number().int().positive(),
  fuelLevelPercent: z.number().int().min(0).max(100).optional(),
});

const LogServiceSchema = z.object({
  vehicleId: z.string().uuid(),
  serviceMileageKm: z.number().int().positive(),
  nextServiceIntervalKm: z.number().int().default(10000),
  notes: z.string().optional(),
});

export async function updateVehicleTelemetryAction(rawInput: unknown) {
  try {
    const parsed = UpdateMileageSchema.safeParse(rawInput);
    if (!parsed.success) {
      return { success: false, error: "Validation failed" };
    }

    const { vehicleId, currentMileageKm, fuelLevelPercent } = parsed.data;

    const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, vehicleId)).limit(1);
    if (!vehicle) {
      return { success: false, error: "Vehicle not found" };
    }

    const updateData: Record<string, unknown> = {
      currentMileageKm,
      updatedAt: new Date(),
    };

    if (fuelLevelPercent !== undefined) {
      updateData.fuelLevelPercent = fuelLevelPercent;
    }

    await db.update(vehicles).set(updateData).where(eq(vehicles.id, vehicleId));

    revalidatePath("/fleet");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("[ACTION_ERROR: updateVehicleTelemetryAction]", error);
    return { success: false, error: "Failed to update vehicle telemetry." };
  }
}

export async function logVehicleServiceAction(rawInput: unknown) {
  try {
    const parsed = LogServiceSchema.safeParse(rawInput);
    if (!parsed.success) {
      return { success: false, error: "Validation failed" };
    }

    const { vehicleId, serviceMileageKm, nextServiceIntervalKm } = parsed.data;
    const nextServiceKm = serviceMileageKm + nextServiceIntervalKm;

    await db
      .update(vehicles)
      .set({
        currentMileageKm: serviceMileageKm,
        nextServiceKm,
        status: "active",
        updatedAt: new Date(),
      })
      .where(eq(vehicles.id, vehicleId));

    revalidatePath("/fleet");
    revalidatePath("/");

    return { success: true, nextServiceKm };
  } catch (error) {
    console.error("[ACTION_ERROR: logVehicleServiceAction]", error);
    return { success: false, error: "Failed to record vehicle maintenance service." };
  }
}
