import React from "react";
import { getClientsWithStats } from "@/server/db/queries";
import { ClientListView } from "@/components/clients/client-list-view";

export const dynamic = "force-dynamic";

export default async function CustomersClientsPage() {
  const clients = await getClientsWithStats();
  return <ClientListView initialClients={clients} />;
}
