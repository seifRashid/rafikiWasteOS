import React from "react";
import { getSystemUsers, getSystemRoles } from "@/server/db/queries";
import { UsersView } from "@/components/settings/users-view";

export const dynamic = "force-dynamic";

export default async function SettingsUsersPage() {
  const users = await getSystemUsers();
  const roles = await getSystemRoles();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary">Identity & Access Management</span>
          <h1 className="text-2xl font-black text-foreground tracking-tight">System Users & Login Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Provision staff logins, manage credentials, enforce 2FA, and oversee active authentication sessions.
          </p>
        </div>
      </div>

      <UsersView initialUsers={users as any} roles={roles} />
    </div>
  );
}
