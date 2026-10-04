import React from "react";
import { getInventorySummary } from "@/server/db/queries";
import { InventoryView } from "@/components/inventory/inventory-view";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const batches = await getInventorySummary();

  return <InventoryView initialBatches={batches} />;
}
