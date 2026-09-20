import React from "react";
import { WasteTypesView } from "@/components/settings/waste-types-view";

export const dynamic = "force-dynamic";

export default function SettingsWasteTypesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary">Material Flow & Classification</span>
          <h1 className="text-2xl font-black text-foreground tracking-tight">Waste Types & Scrap Benchmarks</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Configure acceptable waste streams, volumetric bulk densities, recovery rates, and scrap buying rates.
          </p>
        </div>
      </div>

      <WasteTypesView />
    </div>
  );
}
