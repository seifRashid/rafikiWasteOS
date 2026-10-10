import React from "react";
import {
  getRoutesWithAssignments,
  getDispatchSettings,
  getAllRouteStops,
  getFleetAndAssets,
} from "@/server/db/queries";
import { RoutesView } from "@/components/routes/routes-view";

export const dynamic = "force-dynamic";

export default async function OperationsRoutesPage() {
  const [routes, settings, allStops, fleetData] = await Promise.all([
    getRoutesWithAssignments(),
    getDispatchSettings(),
    getAllRouteStops(),
    getFleetAndAssets(),
  ]);

  return (
    <RoutesView
      initialRoutes={routes}
      initialSettings={settings}
      initialStops={allStops}
      fleetVehicles={fleetData.vehicles}
    />
  );
}
