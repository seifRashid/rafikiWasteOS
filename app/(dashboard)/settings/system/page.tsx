import React from "react";
import { SystemSettingsView } from "@/components/settings/system-view";

export const dynamic = "force-dynamic";

export default function SettingsSystemPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary">Platform Infrastructure</span>
          <h1 className="text-2xl font-black text-foreground tracking-tight">System Settings & Integrations</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Regional country presets, PWA offline sync caching rules, and weighbridge scale hardware bridges.
          </p>
        </div>
      </div>

      <SystemSettingsView />
    </div>
  );
}
