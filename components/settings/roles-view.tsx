"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  Plus,
  Check,
  X,
  Layers,
  Sparkles,
  Users,
  CheckCircle2,
  HelpCircle,
  Truck,
  DollarSign,
  Scale,
  FileSpreadsheet,
  Settings,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { SystemRole } from "@/server/db/schema";
import { ALL_PERMISSIONS, type PermissionDefinition } from "@/server/db/queries";

interface RolesViewProps {
  initialRoles: SystemRole[];
  allPermissions: PermissionDefinition[];
}

export function RolesView({ initialRoles, allPermissions }: RolesViewProps) {
  const [rolesList, setRolesList] = useState<SystemRole[]>(initialRoles);
  const [selectedRoleSlug, setSelectedRoleSlug] = useState<string>(initialRoles[1]?.slug || "operations_manager");
  const [isCreateRoleModalOpen, setIsCreateRoleModalOpen] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // New role form state
  const [newRoleForm, setNewRoleForm] = useState({
    name: "",
    slug: "",
    description: "",
    badgeColor: "#08A6BA",
    permissions: [
      "operations:view_jobs",
      "waste:view_inventory",
      "reports:export_operations",
    ],
  });

  const activeRole = rolesList.find((r) => r.slug === selectedRoleSlug) || rolesList[0];

  // Group permissions by category
  const categories = Array.from(new Set(allPermissions.map((p) => p.category)));

  const togglePermissionForActiveRole = (permissionId: string) => {
    if (activeRole.slug === "super_admin") {
      // Super Admin has all permissions immutable
      return;
    }

    setRolesList((prev) =>
      prev.map((role) => {
        if (role.slug === activeRole.slug) {
          const currentPermissions = role.permissions || [];
          const exists = currentPermissions.includes(permissionId);
          const updatedPermissions = exists
            ? currentPermissions.filter((p) => p !== permissionId)
            : [...currentPermissions, permissionId];

          return { ...role, permissions: updatedPermissions };
        }
        return role;
      })
    );
  };

  const handleGrantAllInCategory = (category: string) => {
    if (activeRole.slug === "super_admin") return;
    const categoryPermIds = allPermissions.filter((p) => p.category === category).map((p) => p.id);
    setRolesList((prev) =>
      prev.map((role) => {
        if (role.slug === activeRole.slug) {
          const merged = Array.from(new Set([...(role.permissions || []), ...categoryPermIds]));
          return { ...role, permissions: merged };
        }
        return role;
      })
    );
  };

  const handleRevokeAllInCategory = (category: string) => {
    if (activeRole.slug === "super_admin") return;
    const categoryPermIds = new Set(allPermissions.filter((p) => p.category === category).map((p) => p.id));
    setRolesList((prev) =>
      prev.map((role) => {
        if (role.slug === activeRole.slug) {
          const filtered = (role.permissions || []).filter((p) => !categoryPermIds.has(p));
          return { ...role, permissions: filtered };
        }
        return role;
      })
    );
  };

  const handleSaveCustomRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleForm.name) return;

    const generatedSlug = newRoleForm.slug || newRoleForm.name.toLowerCase().replace(/[^a-z0-9]/g, "_");

    const createdRole: SystemRole = {
      id: "role-" + Date.now().toString().slice(-4),
      slug: generatedSlug,
      name: newRoleForm.name,
      description: newRoleForm.description || "Custom operational role with tailored permissions",
      badgeColor: newRoleForm.badgeColor,
      permissions: newRoleForm.permissions,
      isSystem: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setRolesList([...rolesList, createdRole]);
    setSelectedRoleSlug(createdRole.slug);
    setIsCreateRoleModalOpen(false);
    setSuccessBanner(`Created custom role "${createdRole.name}" with ${createdRole.permissions.length} specific permissions.`);
    setTimeout(() => setSuccessBanner(null), 5000);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Operations":
        return <Truck className="w-4 h-4 text-[#08A6BA]" />;
      case "Finance & Billing":
        return <DollarSign className="w-4 h-4 text-[#8B5CF6]" />;
      case "Waste & Inventory":
        return <Scale className="w-4 h-4 text-[#00993F]" />;
      case "Reports & Impact":
        return <FileSpreadsheet className="w-4 h-4 text-[#FECA36]" />;
      default:
        return <Settings className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Success Notification */}
      {successBanner && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-sm font-semibold">{successBanner}</span>
          </div>
          <button onClick={() => setSuccessBanner(null)} className="text-emerald-500 hover:text-emerald-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Role Selector Tabs / Cards */}
      <div className="bg-white p-5 rounded-2xl border border-border shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
          <div>
            <h2 className="text-base font-bold text-foreground">Operational Roles & Assignment</h2>
            <p className="text-xs text-muted-foreground">
              Select a role to inspect and configure its granular, domain-specific security permissions.
            </p>
          </div>
          <button
            onClick={() => setIsCreateRoleModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary/90 transition-all shadow-xs shrink-0 self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            Create Custom Role
          </button>
        </div>

        {/* Roles Carousel / Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {rolesList.map((role) => {
            const isSelected = role.slug === selectedRoleSlug;
            const permCount = role.permissions?.length || 0;
            const totalPerms = allPermissions.length;
            const pct = Math.round((permCount / totalPerms) * 100);

            return (
              <button
                key={role.id}
                onClick={() => setSelectedRoleSlug(role.slug)}
                className={`text-left p-4 rounded-xl border transition-all relative overflow-hidden ${
                  isSelected
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-xs"
                    : "border-border hover:border-muted-foreground/30 bg-muted/10"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: role.badgeColor }}
                  />
                  {role.isSystem ? (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      System Role
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">
                      Custom Role
                    </span>
                  )}
                </div>

                <div className="font-bold text-sm text-foreground mb-1 flex items-center justify-between">
                  <span>{role.name}</span>
                  {isSelected && <Check className="w-4 h-4 text-primary shrink-0" />}
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2 mb-3 min-h-[32px]">
                  {role.description}
                </p>

                {/* Progress bar of granted permissions */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-semibold">
                    <span className="text-muted-foreground">Permissions</span>
                    <span className="font-mono text-foreground">
                      {permCount} / {totalPerms} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: role.badgeColor,
                      }}
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Role Permission Configuration Matrix */}
      <div className="bg-white rounded-2xl border border-border shadow-xs overflow-hidden">
        {/* Header of Active Role */}
        <div className="p-5 border-b border-border bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black shadow-xs shrink-0"
              style={{ backgroundColor: activeRole.badgeColor }}
            >
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-lg text-foreground tracking-tight">{activeRole.name}</h3>
                <span
                  className="px-2 py-0.5 rounded-full text-[11px] font-bold font-mono"
                  style={{
                    backgroundColor: `${activeRole.badgeColor}20`,
                    color: activeRole.badgeColor,
                  }}
                >
                  {activeRole.slug}
                </span>
                {activeRole.slug === "super_admin" && (
                  <span className="text-xs text-amber-700 bg-amber-100 font-semibold px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Unrestricted Access
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{activeRole.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold self-start sm:self-auto">
            <span className="text-muted-foreground">Active Policy:</span>
            <span className="font-mono text-primary font-bold bg-primary/10 px-2.5 py-1 rounded-lg">
              {activeRole.permissions?.length || 0} permissions granted
            </span>
          </div>
        </div>

        {/* Categories Matrix */}
        <div className="divide-y divide-border/60">
          {categories.map((category) => {
            const categoryPerms = allPermissions.filter((p) => p.category === category);
            const grantedCount = categoryPerms.filter((p) => activeRole.permissions?.includes(p.id)).length;
            const allGranted = grantedCount === categoryPerms.length;

            return (
              <div key={category} className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(category)}
                    <h4 className="font-bold text-sm text-foreground">{category}</h4>
                    <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      {grantedCount} / {categoryPerms.length}
                    </span>
                  </div>

                  {activeRole.slug !== "super_admin" && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleGrantAllInCategory(category)}
                        className="text-[11px] font-semibold text-primary hover:underline"
                      >
                        Grant All
                      </button>
                      <span className="text-muted-foreground text-xs">•</span>
                      <button
                        onClick={() => handleRevokeAllInCategory(category)}
                        className="text-[11px] font-semibold text-rose-600 hover:underline"
                      >
                        Revoke All
                      </button>
                    </div>
                  )}
                </div>

                {/* Permission Cards / Toggles */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {categoryPerms.map((perm) => {
                    const isGranted = activeRole.permissions?.includes(perm.id);
                    const isSuperAdmin = activeRole.slug === "super_admin";

                    return (
                      <div
                        key={perm.id}
                        onClick={() => togglePermissionForActiveRole(perm.id)}
                        className={`p-3 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                          isSuperAdmin
                            ? "border-emerald-200 bg-emerald-50/40 cursor-default"
                            : isGranted
                            ? "border-primary/40 bg-primary/5 cursor-pointer hover:border-primary shadow-xs"
                            : "border-border bg-white cursor-pointer hover:border-muted-foreground/40"
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-foreground">{perm.name}</span>
                          </div>
                          <p className="text-[11px] text-muted-foreground leading-snug">
                            {perm.description}
                          </p>
                          <span className="inline-block text-[10px] font-mono text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded">
                            {perm.id}
                          </span>
                        </div>

                        <div className="shrink-0 mt-0.5">
                          {isGranted ? (
                            <span className="w-5 h-5 rounded-md bg-primary text-white flex items-center justify-center">
                              <Check className="w-3.5 h-3.5" />
                            </span>
                          ) : (
                            <span className="w-5 h-5 rounded-md border border-border bg-muted/20 flex items-center justify-center" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create Custom Role Modal */}
      {isCreateRoleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-border shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-border bg-muted/20">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground">Create Custom Role</h3>
                  <p className="text-xs text-muted-foreground">Define tailored permission boundaries</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateRoleModalOpen(false)}
                className="p-1 text-muted-foreground hover:text-foreground rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomRole} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-foreground uppercase mb-1">
                  Role Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Depot Shift Supervisor"
                  value={newRoleForm.name}
                  onChange={(e) => setNewRoleForm({ ...newRoleForm, name: e.target.value })}
                  className="w-full text-sm px-3 py-2 border border-border rounded-lg bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground uppercase mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Operational responsibilities for this role..."
                  value={newRoleForm.description}
                  onChange={(e) => setNewRoleForm({ ...newRoleForm, description: e.target.value })}
                  className="w-full text-sm px-3 py-2 border border-border rounded-lg bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground uppercase mb-1">
                  Badge Color
                </label>
                <div className="flex items-center gap-2">
                  {["#00993F", "#08A6BA", "#FECA36", "#8B5CF6", "#3B82F6", "#EC4899", "#F97316"].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewRoleForm({ ...newRoleForm, badgeColor: color })}
                      className={`w-7 h-7 rounded-full border-2 transition-all ${
                        newRoleForm.badgeColor === color ? "border-foreground scale-110 shadow-xs" : "border-transparent"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsCreateRoleModalOpen(false)}
                  className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 shadow-xs"
                >
                  Create & Configure Permissions
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
