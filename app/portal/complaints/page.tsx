import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/server";
import { getClientOrganization } from "@/server/db/client-portal-queries";
import { getClientCustomerComplaints } from "@/server/db/customer-support-queries";
import { ClientComplaintsView } from "@/components/portal/client-complaints-view";
import { db } from "@/server/db";
import { clients } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function ClientComplaintsPage() {
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

  const [client, complaints] = await Promise.all([
    getClientOrganization(activeClientId),
    getClientCustomerComplaints(activeClientId),
  ]);

  if (!client) {
    redirect("/portal");
  }

  return <ClientComplaintsView initialComplaints={complaints} client={client} />;
}
