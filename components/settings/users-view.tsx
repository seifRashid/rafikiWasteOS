"use client";

import React, { useState } from "react";
import {
  Users,
  Shield,
  KeyRound,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Plus,
  Search,
  Copy,
  Check,
  RefreshCw,
  LogIn,
  Laptop,
  Radio,
  Lock,
  Mail,
  Building2,
  Truck,
  X,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import type { SystemUser, SystemRole } from "@/server/db/schema";

interface UserWithLogin extends SystemUser {
  loginDetails: {
    username: string;
    authProvider: string;
    activeSessions: number;
    lastDevice: string;
    ipAddress: string;
  };
}

interface UsersViewProps {
  initialUsers: UserWithLogin[];
  roles: SystemRole[];
}

export function UsersView({ initialUsers, roles }: UsersViewProps) {
  const [userList, setUserList] = useState<UserWithLogin[]>(initialUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [simulatedUser, setSimulatedUser] = useState<UserWithLogin | null>(null);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    username: "",
    phone: "",
    role: "driver_collector",
    depotLocation: "Central Transfer Station",
    assignedVehiclePlate: "",
    tempPassword: "RafikiPass2026!" + Math.floor(100 + Math.random() * 900),
    require2FA: true,
  });

  const filteredUsers = userList.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.loginDetails.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.assignedVehiclePlate && u.assignedVehiclePlate.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    const matchesStatus = statusFilter === "all" || u.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const totalUsers = userList.length;
  const activeSessionsToday = userList.filter((u) => u.loginDetails.activeSessions > 0).length;
  const twoFactorCount = userList.filter((u) => u.twoFactorEnabled).length;
  const driverLogins = userList.filter((u) => u.role === "driver_collector").length;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleStatus = (id: string) => {
    setUserList((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const nextStatus = u.status === "active" ? "suspended" : "active";
          return { ...u, status: nextStatus };
        }
        return u;
      })
    );
  };

  const handleResetPassword = (u: UserWithLogin) => {
    const newPass = "RafikiPass" + Math.floor(1000 + Math.random() * 9000) + "#";
    setActionSuccessMessage(`Generated temporary password for ${u.fullName}: ${newPass}`);
    setTimeout(() => setActionSuccessMessage(null), 6000);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email) return;

    const matchedRole = roles.find((r) => r.slug === formData.role);

    const newUser: UserWithLogin = {
      id: "usr-" + Date.now().toString().slice(-4),
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone || "+254 700 000 000",
      role: formData.role as any,
      roleTitle: matchedRole?.name || "Staff Member",
      status: "active",
      avatarUrl: null,
      depotLocation: formData.depotLocation,
      assignedVehiclePlate: formData.assignedVehiclePlate || null,
      lastLoginAt: new Date(),
      lastLoginIp: "102.164.12.88 (Initial Provision)",
      twoFactorEnabled: formData.require2FA,
      customPermissions: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false,
      loginDetails: {
        username: formData.username || formData.email.split("@")[0],
        authProvider: "Neon Auth (Email + Password)",
        activeSessions: 1,
        lastDevice: "Provisional Login / Web",
        ipAddress: "102.164.12.88",
      },
    };

    setUserList([newUser, ...userList]);
    setIsCreateModalOpen(false);
    setActionSuccessMessage(`Created login account for ${newUser.fullName}. Login: ${newUser.email} | Temporary Password: ${formData.tempPassword}`);
  };

  const getRoleColor = (roleSlug: string) => {
    const role = roles.find((r) => r.slug === roleSlug);
    return role?.badgeColor || "#00993F";
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Message */}
      {actionSuccessMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl p-4 flex items-start justify-between shadow-xs transition-all">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Account & Login Action Confirmed</p>
              <p className="text-xs text-emerald-700 font-mono mt-0.5">{actionSuccessMessage}</p>
            </div>
          </div>
          <button
            onClick={() => setActionSuccessMessage(null)}
            className="text-emerald-500 hover:text-emerald-700 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Simulated Login Banner */}
      {simulatedUser && (
        <div className="bg-blue-50 border border-blue-200 text-blue-950 rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <LogIn className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm font-bold">
                Logged in as: <span className="font-mono text-blue-700">{simulatedUser.fullName}</span> ({simulatedUser.roleTitle})
              </p>
              <p className="text-xs text-blue-600">
                Email: {simulatedUser.email} • Auth Method: {simulatedUser.loginDetails.authProvider} • Last Active: Just now
              </p>
            </div>
          </div>
          <button
            onClick={() => setSimulatedUser(null)}
            className="text-xs font-semibold bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Exit Simulation
          </button>
        </div>
      )}

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total User Logins"
          value={totalUsers.toString()}
          subtitle="Provisioned system identities"
          icon={<Users className="w-5 h-5 text-primary" />}
        />
        <StatCard
          title="Active Sessions Today"
          value={activeSessionsToday.toString()}
          subtitle="Staff authenticated in last 24h"
          icon={<Laptop className="w-5 h-5 text-[#08A6BA]" />}
        />
        <StatCard
          title="2FA Protected Logins"
          value={`${Math.round((twoFactorCount / totalUsers) * 100)}%`}
          subtitle={`${twoFactorCount} of ${totalUsers} accounts enforce 2FA`}
          icon={<ShieldCheck className="w-5 h-5 text-[#FECA36]" />}
        />
        <StatCard
          title="Driver Mobile Logins"
          value={driverLogins.toString()}
          subtitle="PWA Field App tokens issued"
          icon={<Smartphone className="w-5 h-5 text-emerald-600" />}
        />
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-border shadow-xs">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search user, login email, username, or truck..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-muted/40 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs sm:text-sm bg-muted/40 border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All Roles</option>
            {roles.map((r) => (
              <option key={r.id} value={r.slug}>
                {r.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs sm:text-sm bg-muted/40 border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="suspended">Suspended Only</option>
          </select>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-all shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add User & Provision Login
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/30 border-b border-border text-xs text-muted-foreground uppercase font-semibold">
              <tr>
                <th className="px-5 py-3.5">User & Identity</th>
                <th className="px-4 py-3.5">Login Credentials & Method</th>
                <th className="px-4 py-3.5">Role & Access Scope</th>
                <th className="px-4 py-3.5">Last Login & Session</th>
                <th className="px-4 py-3.5">Security (2FA)</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Login Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredUsers.map((u) => {
                const roleColor = getRoleColor(u.role);
                return (
                  <tr key={u.id} className="hover:bg-muted/10 transition-colors">
                    {/* User & Identity */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center font-black text-xs text-white shadow-xs shrink-0"
                          style={{ backgroundColor: roleColor }}
                        >
                          {u.fullName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </div>
                        <div>
                          <div className="font-bold text-foreground text-sm flex items-center gap-1.5">
                            {u.fullName}
                            {u.loginDetails.activeSessions > 0 && (
                              <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-100" title="Active session" />
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <span className="font-mono text-primary font-medium">@{u.loginDetails.username}</span>
                            <span>•</span>
                            <span>{u.phone}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Login Credentials & Method */}
                    <td className="px-4 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          <span className="font-mono text-xs font-semibold text-foreground">{u.email}</span>
                          <button
                            onClick={() => handleCopy(u.email, `email-${u.id}`)}
                            className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
                            title="Copy email"
                          >
                            {copiedId === `email-${u.id}` ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <KeyRound className="w-3 h-3 text-amber-500 shrink-0" />
                          <span>{u.loginDetails.authProvider}</span>
                        </div>
                      </div>
                    </td>

                    {/* Role & Access Scope */}
                    <td className="px-4 py-4">
                      <div className="space-y-1">
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold"
                          style={{
                            backgroundColor: `${roleColor}18`,
                            color: roleColor,
                          }}
                        >
                          {u.roleTitle}
                        </span>
                        <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                          {u.assignedVehiclePlate ? (
                            <span className="flex items-center gap-1 text-primary font-mono font-medium">
                              <Truck className="w-3 h-3" />
                              {u.assignedVehiclePlate}
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3 h-3" />
                              {u.depotLocation}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Last Login & Session */}
                    <td className="px-4 py-4">
                      <div className="space-y-0.5">
                        <div className="text-xs font-medium text-foreground flex items-center gap-1">
                          <Radio className="w-3 h-3 text-emerald-500 animate-pulse" />
                          {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Never"}
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate max-w-[160px]" title={u.loginDetails.lastDevice}>
                          {u.loginDetails.lastDevice}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-mono">
                          {u.loginDetails.ipAddress}
                        </p>
                      </div>
                    </td>

                    {/* Security 2FA */}
                    <td className="px-4 py-4">
                      {u.twoFactorEnabled ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          2FA Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold">
                          <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                          Password Only
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4">
                      <button
                        onClick={() => handleToggleStatus(u.id)}
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold transition-colors ${
                          u.status === "active"
                            ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                            : "bg-rose-100 text-rose-800 hover:bg-rose-200"
                        }`}
                        title="Click to toggle status"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${u.status === "active" ? "bg-emerald-600" : "bg-rose-600"}`} />
                        {u.status === "active" ? "Active" : "Suspended"}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleResetPassword(u)}
                          className="p-1.5 text-muted-foreground hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Generate Temporary Password"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setSimulatedUser(u)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-muted hover:bg-primary hover:text-white rounded-lg text-xs font-semibold text-foreground transition-all"
                          title="Simulate Login As This User"
                        >
                          <LogIn className="w-3.5 h-3.5" />
                          Login As
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Provision New User Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-border shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-border bg-muted/20">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-base">Provision New User & Login</h3>
                  <p className="text-xs text-muted-foreground">Issue operational credentials and role permissions</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 text-muted-foreground hover:text-foreground rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground uppercase mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kennedy Ochieng"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full text-sm px-3 py-2 border border-border rounded-lg bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground uppercase mb-1">
                    Username *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. kennedy.o"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full text-sm px-3 py-2 border border-border rounded-lg bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground uppercase mb-1">
                    Login Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="kennedy@rafikiwaste.co.ke"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full text-sm px-3 py-2 border border-border rounded-lg bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground uppercase mb-1">
                    Phone (M-Pesa / SMS) *
                  </label>
                  <input
                    type="tel"
                    placeholder="+254 7XX XXX XXX"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full text-sm px-3 py-2 border border-border rounded-lg bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground uppercase mb-1">
                    Role & Permission Tier *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full text-sm px-3 py-2 border border-border rounded-lg bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.slug}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground uppercase mb-1">
                    Depot / Hub
                  </label>
                  <input
                    type="text"
                    value={formData.depotLocation}
                    onChange={(e) => setFormData({ ...formData, depotLocation: e.target.value })}
                    className="w-full text-sm px-3 py-2 border border-border rounded-lg bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              {formData.role === "driver_collector" && (
                <div>
                  <label className="block text-xs font-bold text-foreground uppercase mb-1">
                    Assigned Truck Plate (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. KDD 482B"
                    value={formData.assignedVehiclePlate}
                    onChange={(e) => setFormData({ ...formData, assignedVehiclePlate: e.target.value })}
                    className="w-full text-sm px-3 py-2 border border-border rounded-lg bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              )}

              <div className="p-3 bg-muted/40 rounded-xl border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-foreground">Temporary Login Password</label>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        tempPassword: "RafikiPass" + Math.floor(1000 + Math.random() * 9000) + "!",
                      })
                    }
                    className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" /> Regenerate
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={formData.tempPassword}
                    className="w-full font-mono text-xs px-3 py-1.5 bg-white border border-border rounded-lg font-bold text-foreground"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy(formData.tempPassword, "temp-pwd")}
                    className="px-3 py-1.5 bg-white border border-border text-xs font-semibold rounded-lg hover:bg-muted"
                  >
                    {copiedId === "temp-pwd" ? "Copied" : "Copy"}
                  </button>
                </div>
                <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={formData.require2FA}
                    onChange={(e) => setFormData({ ...formData, require2FA: e.target.checked })}
                    className="rounded border-border text-primary focus:ring-primary"
                  />
                  <span>Enforce Two-Factor Authentication (2FA) upon first login</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 shadow-xs"
                >
                  Provision Login Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
