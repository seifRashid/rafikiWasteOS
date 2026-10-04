import React from "react";
import { getFleetAndAssets } from "@/server/db/queries";
import { FleetView } from "@/components/fleet/fleet-view";

export const dynamic = "force-dynamic";

export default async function FleetVehiclesPage() {
  const { vehicles, assets } = await getFleetAndAssets();
  return <FleetView initialVehicles={vehicles} initialAssets={assets} />;
}
