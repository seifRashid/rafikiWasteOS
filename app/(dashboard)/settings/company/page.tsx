import React from "react";
import { CompanyView } from "@/components/settings/company-view";

export const dynamic = "force-dynamic";

export default function SettingsCompanyPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary">Organization & Statutory</span>
          <h1 className="text-2xl font-black text-foreground tracking-tight">Company Profile & Environmental Licensing</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage corporate details, KRA tax PIN, NEMA waste transport permits, and operational transfer depots.
          </p>
        </div>
      </div>

      <CompanyView />
    </div>
  );
}
