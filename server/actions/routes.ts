"use server";

import { z } from "zod";
import { db } from "@/server/db";
import {
  routes,
  collectionJobs,
  vehicles,
  dispatchSettings,
  clients,
} from "@/server/db/schema";
import { eq, and, desc, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import {
  isClientCollectedOnDay,
  getWeekdayNameFromDate,
  getClientDefaultStream,
  getClientDefaultExpectedKg,
} from "@/lib/schedule-utils";
import { syncInventoryBatchFromJob } from "@/server/services/inventory-intake-sync";

const isUuid = (str: string | null | undefined): boolean => {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
};

// In-memory 60s TTL cache per date so passive page navigations to /operations/collections,
// /operations/routes, and /driver do not re-run 20+ DB writes on every click
const SYNC_DATE_TTL_MS = 60 * 1000;
const syncDateCache = new Map<
  string,
  {
    timestamp: number;
    result: {
      dateStr: string;
      weekday: string;
      dueClientsCount: number;
      eligibleStopsCount: number;
      routesCount: number;
      maxStops: number;
    };
  }
>();

// 1. Create a manual route
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

    syncDateCache.delete(routeDate);
    revalidatePath("/operations/routes");
    revalidatePath("/operations/schedule");
    revalidatePath("/");

    return { success: true, data: newRoute };
  } catch (error) {
    console.error("[ACTION_ERROR: createRouteAction]", error);
    return { success: false, error: "Failed to create route manifest." };
  }
}

// 2. Reschedule a missed stop or specific job
export async function rescheduleMissedStopAction(jobId: string, newDateIso: string) {
  try {
    await db
      .update(collectionJobs)
      .set({
        status: "scheduled",
        scheduledAt: new Date(`${newDateIso}T09:00:00.000Z`),
        routeId: null,
        stopSequence: 0,
        missedReason: null,
        updatedAt: new Date(),
      })
      .where(eq(collectionJobs.id, jobId));

    syncDateCache.clear();
    revalidatePath("/operations/collections");
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

    syncDateCache.clear();
    revalidatePath("/operations/routes");
    revalidatePath("/operations/schedule");
    revalidatePath("/settings/system");

    return { success: true, maxStopsPerRoute, autoSplitExceededRoutes };
  } catch (error) {
    console.error("[ACTION_ERROR: updateDispatchSettingsAction]", error);
    return { success: false, error: "Failed to update route capacity settings." };
  }
}

// 4. Core Synchronization Engine: Sync Collection Jobs & Routes for a Specific Date from Real Client Schedules
export async function syncDateOperations(
  targetDateIso: string,
  capacityOverride?: number,
  forceSync = false
) {
  const dateStr = targetDateIso || new Date().toISOString().split("T")[0];
  const now = Date.now();

  // Fast path: if already synced within the last 60s and no capacityOverride/forceSync is requested, return cached result immediately
  if (!forceSync && capacityOverride === undefined) {
    const cached = syncDateCache.get(dateStr);
    if (cached && now - cached.timestamp < SYNC_DATE_TTL_MS) {
      return cached.result;
    }
  }

  const weekday = getWeekdayNameFromDate(dateStr);

  // 1. Fetch capacity settings, active clients, existing jobs, fleet vehicles, and existing routes in PARALLEL
  const [settingsList, allActiveClients, allExistingJobs, fleetVehicles, existingRoutesForDate] =
    await Promise.all([
      db.select().from(dispatchSettings).limit(1),
      db
        .select()
        .from(clients)
        .where(and(eq(clients.isActive, true), eq(clients.isDeleted, false))),
      db.select().from(collectionJobs),
      db
        .select()
        .from(vehicles)
        .where(eq(vehicles.isDeleted, false))
        .orderBy(desc(vehicles.createdAt)),
      db
        .select()
        .from(routes)
        .where(and(eq(routes.routeDate, dateStr), eq(routes.isDeleted, false)))
        .orderBy(routes.routeCode),
    ]);

  const settings = settingsList[0];
  const rawMaxStops =
    capacityOverride !== undefined && !isNaN(capacityOverride)
      ? capacityOverride
      : settings?.maxStopsPerRoute || 6;
  const maxStops = Math.max(1, Math.min(30, Math.floor(rawMaxStops)));

  // Determine which clients are contracted / due on this weekday (strictly excluding expired contracts)
  const dueClients = allActiveClients.filter(
    (c) => (!c.contractEndDate || c.contractEndDate >= dateStr) && isClientCollectedOnDay(c, weekday)
  );

  const prefix = `JOB-${dateStr.replace(/-/g, "")}-`;
  let maxSeq = 0;
  for (const j of allExistingJobs) {
    if (j.jobNumber && j.jobNumber.startsWith(prefix)) {
      const parsedNum = parseInt(j.jobNumber.slice(prefix.length), 10);
      if (!isNaN(parsedNum) && parsedNum > maxSeq) {
        maxSeq = parsedNum;
      }
    }
  }

  const existingJobsForDate = allExistingJobs.filter((j) => {
    if (j.isDeleted) return false;
    const jDate = new Date(j.scheduledAt).toISOString().split("T")[0];
    return jDate === dateStr;
  });

  // Prune any legacy test jobs or routine jobs on this date that:
  // a) Belong to a client who is NOT scheduled for this weekday (unless the job is explicitly marked [On-Demand])
  // b) Are duplicate scheduled jobs for the same client on this single date
  const dueClientIds = new Set(dueClients.map((c) => c.id));
  const retainedClientIds = new Set<string>();
  const jobIdsToPrune: string[] = [];

  for (const job of existingJobsForDate) {
    const isDue = dueClientIds.has(job.clientId);
    const isOnDemand = job.notes && job.notes.includes("[On-Demand");
    const isCompleted = ["collected", "delivered", "completed"].includes(job.status);
    const isDuplicate = retainedClientIds.has(job.clientId);

    if ((!isDue && !isOnDemand && !isCompleted) || (isDuplicate && !isOnDemand && !isCompleted)) {
      jobIdsToPrune.push(job.id);
    } else {
      retainedClientIds.add(job.clientId);
    }
  }

  if (jobIdsToPrune.length > 0) {
    await db
      .update(collectionJobs)
      .set({ isDeleted: true, routeId: null, updatedAt: new Date() })
      .where(inArray(collectionJobs.id, jobIdsToPrune));
  }

  // Generate missing jobs for due clients that don't have a job yet
  const times = [
    "08:00",
    "08:45",
    "09:30",
    "10:15",
    "11:00",
    "11:45",
    "13:00",
    "13:45",
    "14:30",
    "15:15",
    "16:00",
    "16:45",
  ];

  const newJobsToInsert = [];
  let seqCounter = maxSeq + 1;

  for (const client of dueClients) {
    if (!retainedClientIds.has(client.id)) {
      const time = times[(seqCounter - 1) % times.length];
      const jobNum = `JOB-${dateStr.replace(/-/g, "")}-${String(seqCounter).padStart(3, "0")}`;

      newJobsToInsert.push({
        jobNumber: jobNum,
        clientId: client.id,
        wasteStream: getClientDefaultStream(client),
        expectedQuantityKg: getClientDefaultExpectedKg(client),
        scheduledAt: new Date(`${dateStr}T${time}:00.000Z`),
        status: "scheduled" as const,
        notes: `Recurring ${weekday} scheduled pickup for ${client.name}`,
      });
      seqCounter++;
    }
  }

  let insertedJobs: Array<typeof collectionJobs.$inferSelect> = [];
  if (newJobsToInsert.length > 0) {
    insertedJobs = await db.insert(collectionJobs).values(newJobsToInsert).returning();
  }

  // Build client lookup map from active clients
  const clientMap = new Map(allActiveClients.map((c) => [c.id, c]));
  const prunedSet = new Set(jobIdsToPrune);

  const combinedDateJobs = [
    ...existingJobsForDate.filter((j) => !prunedSet.has(j.id)),
    ...insertedJobs,
  ].sort((a, b) => {
    const seqDiff = (a.stopSequence || 0) - (b.stopSequence || 0);
    if (seqDiff !== 0) return seqDiff;
    return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
  });

  const targetDateJobs = combinedDateJobs
    .map((job) => ({
      job,
      client: clientMap.get(job.clientId) || null,
    }))
    .filter(({ job, client }) => {
      if ((job.status as string) === "cancelled") return false;
      const isDue = client ? isClientCollectedOnDay(client, weekday) : false;
      const isOnDemand = job.notes && job.notes.includes("[On-Demand");
      const isAlreadyProgressed = ["in_progress", "collected", "delivered", "completed"].includes(
        job.status
      );
      return isDue || isOnDemand || isAlreadyProgressed;
    });

  const totalEligibleStops = targetDateJobs.length;
  const routesNeeded = totalEligibleStops > 0 ? Math.ceil(totalEligibleStops / maxStops) : 0;

  // If routesNeeded is less than existing routes, mark surplus as deleted and unassign their jobs
  if (existingRoutesForDate.length > routesNeeded) {
    const surplusIds = existingRoutesForDate.slice(routesNeeded).map((r) => r.id);
    if (surplusIds.length > 0) {
      await Promise.all([
        db
          .update(routes)
          .set({ isDeleted: true, updatedAt: new Date() })
          .where(inArray(routes.id, surplusIds)),
        db
          .update(collectionJobs)
          .set({ routeId: null, updatedAt: new Date() })
          .where(inArray(collectionJobs.routeId, surplusIds)),
      ]);
    }
  }

  // Fallback driver roster if vehicles lack assigned names
  const defaultDrivers = [
    { name: "Mohammed Bakari", phone: "+254 712 345 678", crew: "Peter Maina, Samuel Kipkorir" },
    { name: "Julien Ochieng", phone: "+254 723 456 789", crew: "David Karanja, Wilson Mutua" },
    { name: "Brian Otieno", phone: "+254 734 567 890", crew: "Boniface Otieno, Joseph Mwangi" },
  ];

  // Partition eligible jobs into routes
  for (let rIndex = 0; rIndex < routesNeeded; rIndex++) {
    const sliceStart = rIndex * maxStops;
    const sliceEnd = Math.min(sliceStart + maxStops, totalEligibleStops);
    const batch = targetDateJobs.slice(sliceStart, sliceEnd);

    const assignedVehicle = fleetVehicles[rIndex % (fleetVehicles.length || 1)] || null;
    const fallbackDriver = defaultDrivers[rIndex % defaultDrivers.length];
    const driverName = assignedVehicle?.assignedDriverName || fallbackDriver.name;
    const driverPhone = assignedVehicle?.assignedDriverPhone || fallbackDriver.phone;
    const crewNames = fallbackDriver.crew;

    const routeCode = `RT-${dateStr.replace(/-/g, "").slice(4)}-0${rIndex + 1}`;
    const routeName =
      routesNeeded > 1
        ? `Daily Master Loop (Route ${rIndex + 1} of ${routesNeeded})`
        : `Daily Primary Manifest (${dateStr})`;

    let routeRecord = existingRoutesForDate[rIndex];
    if (!routeRecord) {
      const [foundByCode] = await db
        .select()
        .from(routes)
        .where(and(eq(routes.routeCode, routeCode), eq(routes.routeDate, dateStr)))
        .limit(1);
      routeRecord = foundByCode;
    }

    const completedCount = batch.filter(({ job }) =>
      ["collected", "delivered", "completed"].includes(job.status)
    ).length;

    if (!routeRecord) {
      [routeRecord] = await db
        .insert(routes)
        .values({
          routeCode,
          name: routeName,
          vehicleId: assignedVehicle?.id || null,
          driverName,
          driverPhone,
          crewNames,
          routeDate: dateStr,
          status: "planned",
          totalStops: batch.length,
          completedStops: completedCount,
          startDepot: settings?.defaultStartDepot || "Central Logistics Depot",
          endDestination: settings?.defaultEndDestination || "Mombasa Road MRF & Weighbridge",
          isDeleted: false,
        })
        .returning();
    } else if (
      routeRecord.routeCode !== routeCode ||
      routeRecord.name !== routeName ||
      routeRecord.totalStops !== batch.length ||
      routeRecord.completedStops !== completedCount ||
      routeRecord.isDeleted
    ) {
      await db
        .update(routes)
        .set({
          routeCode,
          name: routeName,
          totalStops: batch.length,
          completedStops: completedCount,
          vehicleId: routeRecord.vehicleId || assignedVehicle?.id,
          driverName: routeRecord.driverName || driverName,
          driverPhone: routeRecord.driverPhone || driverPhone,
          crewNames: routeRecord.crewNames || crewNames,
          isDeleted: false,
          updatedAt: new Date(),
        })
        .where(eq(routes.id, routeRecord.id));
    }

    // Only update jobs in this batch whose route assignment, sequence, or status actually changed
    const targetVehId = routeRecord.vehicleId || assignedVehicle?.id || null;
    const targetDriver = routeRecord.driverName || driverName;

    const jobUpdates: Promise<unknown>[] = [];
    for (let sIndex = 0; sIndex < batch.length; sIndex++) {
      const { job } = batch[sIndex];
      const nextStatus: typeof collectionJobs.$inferSelect["status"] = [
        "collected",
        "delivered",
        "completed",
        "in_progress",
      ].includes(job.status)
        ? job.status
        : routeRecord.status === "in_progress"
        ? "in_progress"
        : "assigned";

      const targetSeq = sIndex + 1;
      const needsUpdate =
        job.routeId !== routeRecord.id ||
        job.vehicleId !== targetVehId ||
        job.driverName !== targetDriver ||
        job.stopSequence !== targetSeq ||
        job.status !== nextStatus;

      if (needsUpdate) {
        jobUpdates.push(
          db
            .update(collectionJobs)
            .set({
              routeId: routeRecord.id,
              vehicleId: targetVehId,
              driverName: targetDriver,
              stopSequence: targetSeq,
              status: nextStatus,
              updatedAt: new Date(),
            })
            .where(eq(collectionJobs.id, job.id))
        );
      }
    }

    if (jobUpdates.length > 0) {
      await Promise.all(jobUpdates);
    }
  }

  const syncResult = {
    dateStr,
    weekday,
    dueClientsCount: dueClients.length,
    eligibleStopsCount: totalEligibleStops,
    routesCount: routesNeeded,
    maxStops,
  };

  syncDateCache.set(dateStr, { timestamp: Date.now(), result: syncResult });

  if (forceSync || capacityOverride !== undefined) {
    try {
      revalidatePath("/operations/routes");
      revalidatePath("/operations/schedule");
      revalidatePath("/driver");
      revalidatePath("/operations/collections");
      revalidatePath("/");
    } catch {
      // Ignore outside of server request
    }
  }

  return syncResult;
}

// 5. Auto-Split & Generate Multiple Routes When Capacity Is Exceeded
export async function autoSplitAndGenerateRoutesAction(
  targetDateIso?: string,
  capacityOverride?: number
) {
  try {
    const result = await syncDateOperations(
      targetDateIso || new Date().toISOString().split("T")[0],
      capacityOverride,
      true
    );
    return { success: true, ...result };
  } catch (error) {
    console.error("[ACTION_ERROR: autoSplitAndGenerateRoutesAction]", error);
    return { success: false, error: "Failed to auto-split and generate routes." };
  }
}

// 6. Reactive Fetch & Sync for Daily Operations (used by Date Picker & Route Management)
export async function syncAndGetDailyOperationsAction(targetDateIso: string) {
  try {
    const dateStr = targetDateIso || new Date().toISOString().split("T")[0];
    await syncDateOperations(dateStr, undefined, true);

    const [dailyRoutes, allStopsRaw, allRoutes] = await Promise.all([
      db
        .select({
          route: routes,
          vehicle: vehicles,
        })
        .from(routes)
        .leftJoin(vehicles, eq(routes.vehicleId, vehicles.id))
        .where(and(eq(routes.routeDate, dateStr), eq(routes.isDeleted, false)))
        .orderBy(routes.routeCode),
      db
        .select({
          job: collectionJobs,
          client: clients,
        })
        .from(collectionJobs)
        .leftJoin(clients, eq(collectionJobs.clientId, clients.id))
        .where(and(eq(collectionJobs.isDeleted, false)))
        .orderBy(collectionJobs.stopSequence, collectionJobs.scheduledAt),
      db
        .select({
          route: routes,
          vehicle: vehicles,
        })
        .from(routes)
        .leftJoin(vehicles, eq(routes.vehicleId, vehicles.id))
        .where(eq(routes.isDeleted, false))
        .orderBy(desc(routes.routeDate)),
    ]);

    const dailyStops = allStopsRaw.filter(({ job }) => {
      const jd = new Date(job.scheduledAt).toISOString().split("T")[0];
      return jd === dateStr;
    });

    return {
      success: true,
      routes: dailyRoutes,
      stops: dailyStops,
      allRoutes,
    };
  } catch (error) {
    console.error("[ACTION_ERROR: syncAndGetDailyOperationsAction]", error);
    return { success: false, error: "Failed to synchronize operations for selected date." };
  }
}

// 7. Dispatch Route Action: Update Route Status & Cascade to Assigned Jobs
export async function dispatchRouteAction(
  routeId: string,
  newStatus: "planned" | "in_progress" | "completed" | "cancelled"
) {
  try {
    const [existingRoute] = await db
      .select()
      .from(routes)
      .where(eq(routes.id, routeId))
      .limit(1);

    if (!existingRoute) {
      return { success: false, error: "Route not found in database." };
    }

    if (newStatus === "in_progress") {
      if (!existingRoute.driverName || !existingRoute.vehicleId) {
        return {
          success: false,
          error: "Cannot dispatch route: An active truck and driver must be assigned first.",
        };
      }
    }

    // Update route status
    await db
      .update(routes)
      .set({
        status: newStatus,
        completedStops:
          newStatus === "completed" ? existingRoute.totalStops : existingRoute.completedStops,
        updatedAt: new Date(),
      })
      .where(eq(routes.id, routeId));

    // Cascade to jobs if dispatching
    if (newStatus === "in_progress") {
      await db
        .update(collectionJobs)
        .set({
          status: "in_progress",
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(collectionJobs.routeId, routeId),
            eq(collectionJobs.status, "assigned")
          )
        );
    } else if (newStatus === "completed") {
      const routeJobs = await db
        .select()
        .from(collectionJobs)
        .where(and(eq(collectionJobs.routeId, routeId), eq(collectionJobs.isDeleted, false)));

      for (const rj of routeJobs) {
        if (rj.status !== "missed") {
          await db
            .update(collectionJobs)
            .set({
              status: "completed",
              deliveredAt: rj.deliveredAt || new Date(),
              actualWeightKg: rj.actualWeightKg || rj.expectedQuantityKg || "0.00",
              updatedAt: new Date(),
            })
            .where(eq(collectionJobs.id, rj.id));

          await syncInventoryBatchFromJob(rj.id);
        }
      }
    }

    syncDateCache.clear();
    revalidatePath("/operations/routes");
    revalidatePath("/operations/schedule");
    revalidatePath("/operations/collections");
    revalidatePath("/waste/records");
    revalidatePath("/waste/inventory");
    revalidatePath("/inventory");
    revalidatePath("/driver");
    revalidatePath("/field");
    revalidatePath("/");

    return { success: true, status: newStatus };
  } catch (error) {
    console.error("[ACTION_ERROR: dispatchRouteAction]", error);
    return { success: false, error: "Failed to update dispatch status." };
  }
}

// 8. Update Route Dispatch Details (Vehicle, Driver, Crew)
const UpdateRouteDispatchSchema = z.object({
  routeId: z.string().uuid(),
  vehicleId: z.string().optional().nullable(),
  driverName: z.string().min(2, "Driver name is required"),
  driverPhone: z.string().optional(),
  crewNames: z.string().optional(),
});

export async function updateRouteDispatchDetailsAction(rawInput: unknown) {
  try {
    const parsed = UpdateRouteDispatchSchema.safeParse(rawInput);
    if (!parsed.success) {
      return { success: false, error: "Validation failed" };
    }

    const { routeId, vehicleId, driverName, driverPhone, crewNames } = parsed.data;

    let targetVehicleId: string | null = null;
    if (vehicleId && isUuid(vehicleId)) {
      targetVehicleId = vehicleId;
    }

    await db
      .update(routes)
      .set({
        vehicleId: targetVehicleId,
        driverName: driverName.trim(),
        driverPhone: driverPhone?.trim() || null,
        crewNames: crewNames?.trim() || null,
        updatedAt: new Date(),
      })
      .where(eq(routes.id, routeId));

    // Cascade driver and vehicle to all collection jobs assigned to this route
    await db
      .update(collectionJobs)
      .set({
        driverName: driverName.trim(),
        vehicleId: targetVehicleId,
        updatedAt: new Date(),
      })
      .where(eq(collectionJobs.routeId, routeId));

    syncDateCache.clear();
    revalidatePath("/operations/routes");
    revalidatePath("/operations/schedule");
    revalidatePath("/driver");
    revalidatePath("/field");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("[ACTION_ERROR: updateRouteDispatchDetailsAction]", error);
    return { success: false, error: "Failed to update route assignments." };
  }
}

// 9. Reorder Route Stop Sequence
export async function reorderRouteStopsAction(routeId: string, orderedJobIds: string[]) {
  try {
    await Promise.all(
      orderedJobIds.map((jobId, i) =>
        db
          .update(collectionJobs)
          .set({
            stopSequence: i + 1,
            updatedAt: new Date(),
          })
          .where(and(eq(collectionJobs.id, jobId), eq(collectionJobs.routeId, routeId)))
      )
    );

    syncDateCache.clear();
    revalidatePath("/operations/routes");
    revalidatePath("/driver");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("[ACTION_ERROR: reorderRouteStopsAction]", error);
    return { success: false, error: "Failed to reorder route stops." };
  }
}
