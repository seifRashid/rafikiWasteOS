import React from "react";
import { getContainerAllocations, getAssets } from "@/server/db/queries";
import { ContainersAndAssetsView } from "@/components/fleet/containers-and-assets-view";

export const dynamic = "force-dynamic";

export default async function FleetAssetsPage() {
  const [allocationData, assetsList] = await Promise.all([
    getContainerAllocations(),
    getAssets(),
  ]);

  return (
    <ContainersAndAssetsView
      initialContainerTypes={allocationData.containerTypes}
      initialAssets={assetsList}
      initialTotalStock={allocationData.totalFleetStock}
      initialTotalAllocated={allocationData.totalAllocated}
      initialTotalInDepot={allocationData.totalInDepot}
    />
  );
}
