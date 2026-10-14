import { db } from "./index";
import { collectionJobs, clients, routes, vehicles, users } from "./schema";
import { eq, and, desc } from "drizzle-orm";
import { syncDateOperations } from "../actions/routes";

export interface DriverStop {
  id: string;
  jobNumber: string;
  seq: number;
  clientName: string;
  phone: string;
  address: string;
  wasteStream: string;
  expectedKg: number;
  actualWeightKg: number | null;
  notes: string;
  status: "scheduled" | "assigned" | "in_progress" | "collected" | "delivered" | "completed" | "missed";
  proofPhotoUrl: string | null;
  missedReason: string | null;
  latitude: string | null;
  longitude: string | null;
}

export interface DriverVehicleInfo {
  plateNumber: string;
  model: string;
  capacityKg: string;
  fuelLevelPercent?: number | null;
}

export interface DriverRouteInfo {
  id: string;
  routeCode: string;
  name: string;
  status: string;
  totalStops: number;
  completedStops: number;
  startDepot: string | null;
  endDestination: string | null;
  routeDate: string;
}

export interface AvailableDriver {
  name: string;
  phone: string;
  assignedVehiclePlate: string | null;
}

export interface DriverPortalData {
  driverName: string;
  driverPhone: string;
  vehicle: DriverVehicleInfo | null;
  currentRoute: DriverRouteInfo | null;
  driverRoutes: DriverRouteInfo[];
  stops: DriverStop[];
  availableDrivers: AvailableDriver[];
  targetDate: string;
}

export async function getDriverPortalData(options?: {
  driverName?: string;
  routeId?: string;
  targetDate?: string;
}): Promise<DriverPortalData> {
  const dateStr = options?.targetDate || new Date().toISOString().split("T")[0];

  try {
    // 1. Ensure today's schedule and routes are synchronized
    await syncDateOperations(dateStr);

    // 2. Fetch fleet vehicles, routes, and driver users
    const [fleetVehicles, allRoutes, driverUsers] = await Promise.all([
      db.select().from(vehicles).where(eq(vehicles.isDeleted, false)),
      db
        .select({
          route: routes,
          vehicle: vehicles,
        })
        .from(routes)
        .leftJoin(vehicles, eq(routes.vehicleId, vehicles.id))
        .where(eq(routes.isDeleted, false))
        .orderBy(desc(routes.routeDate)),
      db
        .select()
        .from(users)
        .where(and(eq(users.role, "driver_collector"), eq(users.isDeleted, false))),
    ]);

    // 3. Aggregate available drivers
    const driverMap = new Map<string, AvailableDriver>();

    fleetVehicles.forEach((v) => {
      if (v.assignedDriverName && v.assignedDriverName.trim()) {
        const key = v.assignedDriverName.trim().toLowerCase();
        driverMap.set(key, {
          name: v.assignedDriverName.trim(),
          phone: v.assignedDriverPhone || "+254 712 345 678",
          assignedVehiclePlate: v.plateNumber,
        });
      }
    });

    allRoutes.forEach(({ route, vehicle }) => {
      if (route.driverName && route.driverName.trim()) {
        const key = route.driverName.trim().toLowerCase();
        if (!driverMap.has(key)) {
          driverMap.set(key, {
            name: route.driverName.trim(),
            phone: route.driverPhone || "+254 712 345 678",
            assignedVehiclePlate: vehicle?.plateNumber || null,
          });
        }
      }
    });

    driverUsers.forEach((u) => {
      const key = u.fullName.trim().toLowerCase();
      if (!driverMap.has(key)) {
        driverMap.set(key, {
          name: u.fullName.trim(),
          phone: u.phone || "+254 728 554 992",
          assignedVehiclePlate: u.assignedVehiclePlate || null,
        });
      }
    });

    if (driverMap.size === 0) {
      driverMap.set("mohammed bakari", {
        name: "Mohammed Bakari",
        phone: "+254 712 345 678",
        assignedVehiclePlate: "KDD 482B",
      });
      driverMap.set("julien ochieng", {
        name: "Julien Ochieng",
        phone: "+254 723 456 789",
        assignedVehiclePlate: "KDE 912K",
      });
      driverMap.set("brian otieno", {
        name: "Brian Otieno",
        phone: "+254 734 567 890",
        assignedVehiclePlate: "KDA 304M",
      });
    }

    const availableDrivers = Array.from(driverMap.values());

    // 4. Determine selected driver name
    let activeDriverName = options?.driverName?.trim();
    if (!activeDriverName) {
      // Find driver with active route on dateStr
      const routeForDay = allRoutes.find(({ route }) => {
        const rd =
          typeof route.routeDate === "string"
            ? route.routeDate
            : new Date(route.routeDate).toISOString().split("T")[0];
        return rd === dateStr && route.driverName;
      });

      activeDriverName = routeForDay?.route.driverName || availableDrivers[0]?.name || "Mohammed Bakari";
    }

    const matchedDriverObj =
      availableDrivers.find((d) => d.name.toLowerCase() === activeDriverName!.toLowerCase()) ||
      availableDrivers.find((d) => d.name.toLowerCase().includes(activeDriverName!.toLowerCase())) ||
      availableDrivers[0];

    const finalDriverName = matchedDriverObj ? matchedDriverObj.name : activeDriverName;

    // 5. Find routes specifically for this driver on target dateStr (NEVER fallback to other dates)
    const driverRoutesForDate = allRoutes
      .filter(({ route }) => {
        const rd =
          typeof route.routeDate === "string"
            ? route.routeDate
            : new Date(route.routeDate).toISOString().split("T")[0];
        const isDriver =
          route.driverName &&
          (route.driverName.toLowerCase() === finalDriverName.toLowerCase() ||
            route.driverName.toLowerCase().includes(finalDriverName.toLowerCase()) ||
            finalDriverName.toLowerCase().includes(route.driverName.toLowerCase()));
        return rd === dateStr && isDriver;
      })
      .map((r) => r.route);

    // 6. Select active route for this driver on dateStr
    let activeRoute: typeof routes.$inferSelect | null = null;
    if (options?.routeId) {
      activeRoute = driverRoutesForDate.find((r) => r.id === options.routeId) || null;
    }
    if (!activeRoute && driverRoutesForDate.length > 0) {
      activeRoute = driverRoutesForDate[0];
    }

    // 7. Matched vehicle
    const matchedVehicle =
      fleetVehicles.find((v) => v.id === activeRoute?.vehicleId) ||
      fleetVehicles.find(
        (v) =>
          v.assignedDriverName &&
          v.assignedDriverName.toLowerCase() === finalDriverName.toLowerCase()
      ) ||
      fleetVehicles.find((v) => v.plateNumber === matchedDriverObj?.assignedVehiclePlate) ||
      fleetVehicles[0] ||
      null;

    // 8. Fetch collection stops from DB ONLY for this activeRoute and dateStr
    let rawJobs: Array<{
      job: typeof collectionJobs.$inferSelect;
      client: typeof clients.$inferSelect | null;
      vehicle: typeof vehicles.$inferSelect | null;
    }> = [];

    if (activeRoute) {
      rawJobs = await db
        .select({
          job: collectionJobs,
          client: clients,
          vehicle: vehicles,
        })
        .from(collectionJobs)
        .leftJoin(clients, eq(collectionJobs.clientId, clients.id))
        .leftJoin(vehicles, eq(collectionJobs.vehicleId, vehicles.id))
        .where(
          and(
            eq(collectionJobs.isDeleted, false),
            eq(collectionJobs.routeId, activeRoute.id)
          )
        )
        .orderBy(collectionJobs.stopSequence, collectionJobs.scheduledAt);
    }

    // Map DB rows to DriverStop
    const stops: DriverStop[] = rawJobs.map(({ job, client }, idx) => {
      const expKg = parseFloat(job.expectedQuantityKg || "0") || 300;
      const actKg = job.actualWeightKg ? parseFloat(job.actualWeightKg) : null;
      const streamLabel =
        job.wasteStream.charAt(0).toUpperCase() + job.wasteStream.slice(1) + " Waste";

      return {
        id: job.id,
        jobNumber: job.jobNumber,
        seq: job.stopSequence || idx + 1,
        clientName: client?.name || "Client Scheduled Pickup",
        phone: client?.phone || "+254 712 345 678",
        address: client?.physicalAddress || "Nairobi, Kenya",
        wasteStream: streamLabel,
        expectedKg: expKg,
        actualWeightKg: actKg,
        notes: job.notes || client?.notes || "Routine scheduled collection stop.",
        status: job.status as DriverStop["status"],
        proofPhotoUrl: job.proofPhotoUrl || null,
        missedReason: job.missedReason || null,
        latitude: job.gpsLatitude || client?.latitude || "-1.222384",
        longitude: job.gpsLongitude || client?.longitude || "36.878912",
      };
    });

    const completedCount = stops.filter(
      (s) => s.status === "collected" || s.status === "delivered" || s.status === "completed"
    ).length;

    const formattedDriverRoutes: DriverRouteInfo[] = driverRoutesForDate.map((r) => {
      const rDate =
        typeof r.routeDate === "string"
          ? r.routeDate
          : new Date(r.routeDate).toISOString().split("T")[0];

      return {
        id: r.id,
        routeCode: r.routeCode,
        name: r.name,
        status: r.status,
        totalStops: r.totalStops,
        completedStops: r.id === activeRoute?.id ? completedCount : r.completedStops,
        startDepot: r.startDepot,
        endDestination: r.endDestination,
        routeDate: rDate,
      };
    });

    const currentRouteFormatted: DriverRouteInfo | null = activeRoute
      ? {
          id: activeRoute.id,
          routeCode: activeRoute.routeCode,
          name: activeRoute.name,
          status: activeRoute.status,
          totalStops: activeRoute.totalStops || stops.length,
          completedStops: completedCount,
          startDepot: activeRoute.startDepot,
          endDestination: activeRoute.endDestination,
          routeDate:
            typeof activeRoute.routeDate === "string"
              ? activeRoute.routeDate
              : new Date(activeRoute.routeDate).toISOString().split("T")[0],
        }
      : null;

    const driverPhone =
      activeRoute?.driverPhone ||
      matchedDriverObj?.phone ||
      "+254 712 345 678";

    return {
      driverName: finalDriverName,
      driverPhone,
      vehicle: matchedVehicle
        ? {
            plateNumber: matchedVehicle.plateNumber,
            model: matchedVehicle.model,
            capacityKg: matchedVehicle.capacityKg,
            fuelLevelPercent: matchedVehicle.fuelLevelPercent,
          }
        : null,
      currentRoute: currentRouteFormatted,
      driverRoutes: formattedDriverRoutes,
      stops,
      availableDrivers,
      targetDate: dateStr,
    };
  } catch (error) {
    console.error("[ERROR: getDriverPortalData]", error);
    return {
      driverName: options?.driverName || "Mohammed Bakari",
      driverPhone: "+254 712 345 678",
      vehicle: null,
      currentRoute: null,
      driverRoutes: [],
      stops: [],
      availableDrivers: [],
      targetDate: dateStr,
    };
  }
}
