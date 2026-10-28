import React from "react";
import { getWasteMaterials } from "@/server/db/queries";
import { MaterialsView } from "@/components/waste/materials-view";

export const dynamic = "force-dynamic";

export default async function WasteMaterialsPage() {
  const materials = await getWasteMaterials();

  return <MaterialsView initialMaterials={materials} />;
}
