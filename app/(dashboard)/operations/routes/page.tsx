import React from "react";
import { getRoutesWithAssignments } from "@/server/db/queries";
import { RoutesView } from "@/components/routes/routes-view";

export const dynamic = "force-dynamic";

export default async function OperationsRoutesPage() {
  const routes = await getRoutesWithAssignments();
  return <RoutesView initialRoutes={routes} />;
}
