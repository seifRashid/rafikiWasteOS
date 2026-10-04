import React from "react";
import { getClientsWithStats } from "@/server/db/queries";
import { ImpactView } from "@/components/impact/impact-view";

export const dynamic = "force-dynamic";

export default async function EnvironmentalReportsPage() {
  const clients = await getClientsWithStats();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary">Audits & ESG</span>
          <h1 className="text-2xl font-black text-foreground tracking-tight">Environmental Impact & Diversion Audit</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Verified circular diversion rates, GHG avoidance factors, and client sustainability certificates.
          </p>
        </div>
      </div>
      <ImpactView clients={clients} />
    </div>
  );
}
