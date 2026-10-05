import React from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/server";
import { getClientOrganization } from "@/server/db/client-portal-queries";
import { db } from "@/server/db";
import { clients, users } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import {
  Building2,
  MapPin,
  Calendar,
  Layers,
  DollarSign,
  Users,
  Shield,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ClientProfileForm } from "@/components/portal/client-profile-form";
import { formatDate, formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ClientProfilePage() {
  const user = await getCurrentUser();
  if (!user) return null;

  let activeClientId = user.clientId;
  if (!activeClientId && (user.isAdmin || user.role === "operations_manager")) {
    const [firstClient] = await db
      .select()
      .from(clients)
      .where(eq(clients.isDeleted, false))
      .limit(1);
    if (firstClient) activeClientId = firstClient.id;
  }

  if (!activeClientId) return null;

  const [client, clientUsers] = await Promise.all([
    getClientOrganization(activeClientId),
    db
      .select()
      .from(users)
      .where(and(eq(users.clientId, activeClientId), eq(users.isDeleted, false))),
  ]);

  if (!client) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E3E9E5]">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Organization Profile
          </h1>
          <p className="text-xs text-[#4B5563] mt-1">
            Service locations, assigned containers, contract terms, and authorized portal logins.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold bg-[#EDF9F1] text-[#00682B] px-3 py-1.5 rounded-nested border border-[#ADE4C1]">
            {client.accountNumber}
          </span>
          <Badge variant="primary" className="capitalize">
            {client.customerType} Tier
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Organization Summary & Service Location */}
        <div className="space-y-6">
          <div className="bg-white rounded-card p-5 border border-[#E3E9E5] shadow-card-elevated text-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-[#F0F4F2] flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#00993F]" />
              Account Details
            </h3>

            <div>
              <span className="text-[#9CA3AF] block">Legal Entity Name</span>
              <span className="font-bold text-slate-900 text-sm">{client.name}</span>
            </div>

            <div>
              <span className="text-[#9CA3AF] block">Service Location & Region</span>
              <span className="font-semibold text-slate-800 flex items-start gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-[#00993F] shrink-0 mt-0.5" />
                <span>
                  {client.physicalAddress}, {client.countyRegion}
                </span>
              </span>
            </div>

            <div>
              <span className="text-[#9CA3AF] block">Assigned Containers</span>
              <span className="font-semibold text-slate-800">{client.binCount}</span>
            </div>

            <div>
              <span className="text-[#9CA3AF] block">Contract Window</span>
              <span className="font-semibold text-slate-800">
                {formatDate(client.contractStartDate)} — {formatDate(client.contractEndDate)}
              </span>
            </div>

            <div>
              <span className="text-[#9CA3AF] block">Agreed Monthly Fee</span>
              <span className="font-bold text-slate-900 font-mono text-sm">
                {formatCurrency(client.monthlyFee, client.currency || "KES")}
              </span>
            </div>
          </div>

          {/* Authorized Portal Users Card */}
          <div className="bg-white rounded-card p-5 border border-[#E3E9E5] shadow-card-elevated text-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-[#F0F4F2] flex items-center gap-2">
              <Users className="w-4 h-4 text-[#08A6BA]" />
              Authorized Client Users ({clientUsers.length})
            </h3>

            <div className="space-y-2">
              {clientUsers.map((u) => (
                <div
                  key={u.id}
                  className="p-2.5 rounded-nested bg-[#F6F8F7] border border-[#E3E9E5] flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-slate-900 block">{u.fullName}</span>
                    <span className="text-[11px] text-[#4B5563]">{u.email}</span>
                  </div>
                  <Badge variant={u.role === "client_admin" ? "primary" : "neutral"} className="text-[10px]">
                    {u.role === "client_admin" ? "Admin" : "User"}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Editable Contact Information */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-card p-6 border border-[#E3E9E5] shadow-card-elevated">
            <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-[#F0F4F2] mb-4">
              Edit Organization Contacts & Gate Instructions
            </h3>
            <p className="text-xs text-[#4B5563] mb-4">
              Keep your facilities contacts, dispatch telephone numbers, and receiving bay
              instructions up to date for our operations crews.
            </p>

            <ClientProfileForm client={client} />
          </div>
        </div>
      </div>
    </div>
  );
}
