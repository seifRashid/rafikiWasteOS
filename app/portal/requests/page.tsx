import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/server";
import { getClientOrganization } from "@/server/db/client-portal-queries";
import { getClientCustomerRequests } from "@/server/db/customer-support-queries";
import { ClientRequestsView } from "@/components/portal/client-requests-view";
import { db } from "@/server/db";
import { clients } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function ClientRequestsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  let activeClientId = user.clientId;
  if (!activeClientId && (user.isAdmin || user.role === "operations_manager")) {
    const [firstClient] = await db
      .select({ id: clients.id })
      .from(clients)
      .where(eq(clients.isDeleted, false))
      .limit(1);
    activeClientId = firstClient?.id;
  }

  if (!activeClientId) {
    redirect("/portal");
  }

  const [client, requests] = await Promise.all([
    getClientOrganization(activeClientId),
    getClientCustomerRequests(activeClientId),
  ]);

  if (!client) {
    redirect("/portal");
  }

  return <ClientRequestsView initialRequests={requests} client={client} />;
}
