"use server";

import { z } from "zod";
import { db } from "@/server/db";
import { routes, collectionJobs, vehicles, dispatchSettings, routeStatusEnum } from "@/server/db/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const CreateRouteSchema = z.object({
  name: z.string().min(3, "Route name is required"),
  vehicleId: z.string().optional().nullable(),
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

    const isUuid = (str: string | null | undefined): boolean => {
      if (!str) return false;
      return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
    };

    let targetVehicleId: string | null = null;
    if (vehicleId && isUuid(vehicleId)) {
      targetVehicleId = vehicleId;
    } else {
      const [firstVeh] = await db.select({ id: vehicles.id }).from(vehicles).limit(1);
      if (firstVeh) targetVehicleId = firstVeh.id;
    }

    const [newRoute] = await db
      .insert(routes)
      .values({
        routeCode,
        name,
        vehicleId: targetVehicleId,
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

    revalidatePath("/operations/routes");
    revalidatePath("/operations/schedule");
    revalidatePath("/");

    return { success: true, data: newRoute };
  } catch (error) {
    console.error("[ACTION_ERROR: createRouteAction]", error);
    return { success: false, error: "Failed to create route manifest." };
  }
}

// 2. Reschedule a missed stop
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
    revalidatePath("/operations/routes");
    revalidatePath("/operations/schedule");
    revalidatePath("/field");
    revalidatePath("/driver");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("[ACTION_ERROR: rescheduleMissedStopAction]", error);
    return { success: false, error: "Failed to reschedule missed stop." };
  }
}

// 3. Update Dispatch & Route Capacity Settings
const UpdateDispatchSettingsSchema = z.object({
  maxStopsPerRoute: z.number().int().min(1).max(30),
  autoSplitExceededRoutes: z.boolean(),
  defaultStartDepot: z.string().optional(),
  defaultEndDestination: z.string().optional(),
});

export async function updateDispatchSettingsAction(rawInput: unknown) {
  try {
    const parsed = UpdateDispatchSettingsSchema.safeParse(rawInput);
    if (!parsed.success) {
      return { success: false, error: "Validation failed" };
    }

    const { maxStopsPerRoute, autoSplitExceededRoutes, defaultStartDepot, defaultEndDestination } =
      parsed.data;

    const [existing] = await db.select().from(dispatchSettings).limit(1);
    if (existing) {
      await db
        .update(dispatchSettings)
        .set({
          maxStopsPerRoute,
          autoSplitExceededRoutes,
          defaultStartDepot: defaultStartDepot || existing.defaultStartDepot,
          defaultEndDestination: defaultEndDestination || existing.defaultEndDestination,
          updatedAt: new Date(),
        })
        .where(eq(dispatchSettings.id, existing.id));
    } else {
      await db.insert(dispatchSettings).values({
        maxStopsPerRoute,
        autoSplitExceededRoutes,
        defaultStartDepot: defaultStartDepot || "Central Logistics Depot",
        defaultEndDestination: defaultEndDestination || "Mombasa Road MRF & Weighbridge",
      });
    }

    revalidatePath("/operations/routes");
    revalidatePath("/operations/schedule");
    revalidatePath("/settings/system");

    return { success: true, maxStopsPerRoute, autoSplitExceededRoutes };
  } catch (error) {
    console.error("[ACTION_ERROR: updateDispatchSettingsAction]", error);
    return { success: false, error: "Failed to update route capacity settings." };
  }
}

// 4. Auto-Split & Generate Multiple Routes When Capacity Is Exceeded
export async function autoSplitAndGenerateRoutesAction(targetDateIso?: string) {
  try {
    const dateStr = targetDateIso || new Date().toISOString().split("T")[0];

    // Fetch capacity settings
    const [settings] = await db.select().from(dispatchSettings).limit(1);
    const maxStops = settings?.maxStopsPerRoute || 6;

    // Fetch all scheduled / assigned collection jobs
    const dayJobs = await db
      .select()
      .from(collectionJobs)
      .where(and(eq(collectionJobs.isDeleted, false)))
      .orderBy(collectionJobs.scheduledAt);

    // Filter jobs matching target date string
    const targetJobs = dayJobs.filter((j) => {
      const jDate = new Date(j.scheduledAt).toISOString().split("T")[0];
      return jDate === dateStr;
    });

    if (targetJobs.length === 0) {
      return {
        success: false,
        error: `No collection jobs scheduled for ${dateStr}. Please schedule collection points first.`,
      };
    }

    // Fetch fleet vehicles
    const fleetVehicles = await db
      .select()
      .from(vehicles)
      .where(eq(vehicles.isDeleted, false));

    const totalStops = targetJobs.length;
    const routesNeeded = Math.ceil(totalStops / maxStops);

    const createdRouteCodes: string[] = [];

    // Distribute stops into chunks of maxStops
    for (let rIndex = 0; rIndex < routesNeeded; rIndex++) {
      const sliceStart = rIndex * maxStops;
      const sliceEnd = sliceStart + maxStops;
      const batchJobs = targetJobs.slice(sliceStart, sliceEnd);

      const assignedVehicle = fleetVehicles[rIndex % (fleetVehicles.length || 1)] || null;
      const routeCode = `RT-${dateStr.replace(/-/g, "").slice(4)}-0${rIndex + 1}`;
      const routeName =
        routesNeeded > 1
          ? `Daily Master Loop (Route ${rIndex + 1} of ${routesNeeded})`
          : `Daily Primary Manifest (${dateStr})`;

      // Create or update route
      let [routeRecord] = await db
        .select()
        .from(routes)
        .where(and(eq(routes.routeCode, routeCode), eq(routes.routeDate, dateStr)))
        .limit(1);

      if (!routeRecord) {
        [routeRecord] = await db
          .insert(routes)
          .values({
            routeCode,
            name: routeName,
            vehicleId: assignedVehicle?.id || null,
            driverName: assignedVehicle?.assignedDriverName || "Mohammed Bakari",
            driverPhone: assignedVehicle?.assignedDriverPhone || "+254 712 345 678",
            routeDate: dateStr,
            status: "planned",
            totalStops: batchJobs.length,
            completedStops: 0,
            startDepot: settings?.defaultStartDepot || "Central Logistics Depot",
            endDestination: settings?.defaultEndDestination || "Mombasa Road MRF & Weighbridge",
          })
          .returning();
      } else {
        await db
          .update(routes)
          .set({
            totalStops: batchJobs.length,
            vehicleId: assignedVehicle?.id || routeRecord.vehicleId,
            driverName: assignedVehicle?.assignedDriverName || routeRecord.driverName,
            updatedAt: new Date(),
          })
          .where(eq(routes.id, routeRecord.id));
      }

      createdRouteCodes.push(routeCode);

      // Assign jobs to this route with stop_sequence
      for (let sIndex = 0; sIndex < batchJobs.length; sIndex++) {
        const j = batchJobs[sIndex];
        await db
          .update(collectionJobs)
          .set({
            routeId: routeRecord.id,
            vehicleId: assignedVehicle?.id || null,
            driverName: assignedVehicle?.assignedDriverName || "Mohammed Bakari",
            stopSequence: sIndex + 1,
            status: "assigned",
            updatedAt: new Date(),
          })
          .where(eq(collectionJobs.id, j.id));
      }
    }

    revalidatePath("/operations/routes");
    revalidatePath("/operations/schedule");
    revalidatePath("/");

    return {
      success: true,
      routesCreated: routesNeeded,
      totalStopsDistributed: totalStops,
      maxStopsApplied: maxStops,
      routeCodes: createdRouteCodes,
    };
  } catch (error) {
    console.error("[ACTION_ERROR: autoSplitAndGenerateRoutesAction]", error);
    return { success: false, error: "Failed to auto-split and generate routes." };
  }
}
