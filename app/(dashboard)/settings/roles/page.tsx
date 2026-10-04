import React from "react";
import { getSystemRoles, ALL_PERMISSIONS } from "@/server/db/queries";
import { RolesView } from "@/components/settings/roles-view";

export const dynamic = "force-dynamic";

export default async function SettingsRolesPage() {
  const roles = await getSystemRoles();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary">Access Control & Security</span>
          <h1 className="text-2xl font-black text-foreground tracking-tight">Role-Based Access Control (RBAC)</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Configure system roles grounded in granular, domain-specific operational permissions.
          </p>
        </div>
      </div>

      <RolesView initialRoles={roles} allPermissions={ALL_PERMISSIONS} />
    </div>
  );
}
