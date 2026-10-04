import React from "react";
import { getClientsWithStats } from "@/server/db/queries";
import { ImpactView } from "@/components/impact/impact-view";

export const dynamic = "force-dynamic";

export default async function ImpactPage() {
  const clients = await getClientsWithStats();

  return <ImpactView clients={clients} />;
}
