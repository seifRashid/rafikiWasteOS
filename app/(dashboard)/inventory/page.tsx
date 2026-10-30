import React from "react";
import { getInventorySummary, getWasteMaterials } from "@/server/db/queries";
import { InventoryView } from "@/components/inventory/inventory-view";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const [batches, materials] = await Promise.all([
    getInventorySummary(),
    getWasteMaterials(),
  ]);

  return <InventoryView initialBatches={batches} initialMaterials={materials} />;
}
