import {
  getRoutesWithAssignments,
  getDispatchSettings,
  getAllRouteStops,
  getFleetAndAssets,
} from "@/server/db/queries";
import { syncDateOperations } from "@/server/actions/routes";
import { RoutesView } from "@/components/routes/routes-view";

export const dynamic = "force-dynamic";

export default async function RoutesPage() {
  try {
    await syncDateOperations("2026-10-14");
  } catch (e) {
    console.warn("[RoutesPage] initial syncDateOperations fallback:", e);
  }

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
