"use server";

import { z } from "zod";
import { db } from "@/server/db";
import { routes, collectionJobs, routeStatusEnum } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const CreateRouteSchema = z.object({
  name: z.string().min(3, "Route name is required"),
  vehicleId: z.string().uuid(),
  driverName: z.string().min(2, "Driver name is required"),
  driverPhone: z.string().optional(),
  crewNames: z.string().optional(),
  routeDate: z.string(),
  startDepot: z.string().default("Central Logistics Depot"),
  endDestination: z.string().default("Mombasa Road MRF & Weighbridge"),
});

export async function createRouteAction(rawInput: unknown) {
  try {
    const parsed = CreateRouteSchema.safeParse(rawInput);
    if (!parsed.success) {
      return { success: false, error: "Validation failed" };
    }

    const { name, vehicleId, driverName, driverPhone, crewNames, routeDate, startDepot, endDestination } =
      parsed.data;
    const routeCode = `RT-${Date.now().toString().slice(-4)}`;

    const [newRoute] = await db
      .insert(routes)
      .values({
        routeCode,
        name,
        vehicleId,
        driverName,
        driverPhone: driverPhone || null,
        crewNames: crewNames || null,
        routeDate,
        startDepot,
        endDestination,
        status: "planned",
        totalStops: 0,
        completedStops: 0,
      })
      .returning();

    revalidatePath("/routes");
    revalidatePath("/");

    return { success: true, data: newRoute };
  } catch (error) {
    console.error("[ACTION_ERROR: createRouteAction]", error);
    return { success: false, error: "Failed to create route manifest." };
  }
}

export async function rescheduleMissedStopAction(jobId: string, newDateIso: string) {
  try {
    await db
      .update(collectionJobs)
      .set({
        status: "scheduled",
        scheduledAt: new Date(newDateIso),
        missedReason: null,
        updatedAt: new Date(),
      })
      .where(eq(collectionJobs.id, jobId));

    revalidatePath("/collections");
    revalidatePath("/routes");
    revalidatePath("/field");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("[ACTION_ERROR: rescheduleMissedStopAction]", error);
    return { success: false, error: "Failed to reschedule missed stop." };
  }
}
