import React from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/server";
import { getClientPortalDashboard } from "@/server/db/client-portal-queries";
import { db } from "@/server/db";
import { clients } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import {
  Truck,
  CheckCircle2,
  Calendar,
  Scale,
  Recycle,
  DollarSign,
  ArrowRight,
  Clock,
  AlertCircle,
  FileText,
  MapPin,
  Leaf,
  Layers,
} from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { formatWeight, formatCurrency, formatDate, formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ClientPortalDashboardPage() {
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

  const dashboardData = await getClientPortalDashboard(activeClientId);
  if (!dashboardData) {
    return (
      <div className="bg-white rounded-card p-6 border border-[#E3E9E5]">
        <p className="text-xs text-[#9CA3AF]">Dashboard metrics could not be loaded.</p>
      </div>
    );
  }

  const { client, metrics, nextPickup, recentCollections, recentInvoices } = dashboardData;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white rounded-card p-6 border border-[#E3E9E5] shadow-card-elevated flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-[#00993F] bg-[#EDF9F1] px-2.5 py-0.5 rounded-full border border-[#ADE4C1]">
              {client.accountNumber}
            </span>
            <Badge variant="primary">Verified Account</Badge>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1.5">
            {client.name}
          </h1>
          <p className="text-xs text-[#4B5563] mt-1 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#9CA3AF]" />
            <span>
              {client.physicalAddress}, {client.countyRegion}
            </span>
          </p>
        </div>

        {/* Quick Service Status Pill */}
        <div className="bg-[#F0F4F2] p-3.5 rounded-card border border-[#E3E9E5] flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-[#00993F] text-white flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div className="text-xs">
            <span className="text-[#9CA3AF] block font-medium">Next Scheduled Pickup</span>
            {nextPickup ? (
              <span className="font-bold text-slate-900 block mt-0.5">
                {formatDateTime(nextPickup.scheduledAt)}
              </span>
            ) : (
              <span className="font-bold text-slate-900 block mt-0.5">
                {client.collectionFrequency.replace("_", " ")} routine
              </span>
            )}
            <span className="text-[11px] text-[#00993F] font-semibold">
              Streams: {client.wasteStreams}
            </span>
          </div>
        </div>
      </div>

      {/* 4 Essential Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Pickups Completed"
          value={metrics.completedCollections}
          subtitle={`${metrics.totalCollections} total scheduled requests`}
          icon={<CheckCircle2 className="w-5 h-5" />}
          accentColor="primary"
        />

        <StatCard
          title="Total Weight Handled"
          value={formatWeight(metrics.totalWeightKg, "auto")}
          subtitle={`${formatWeight(metrics.organicWeightKg, "auto")} organics composted`}
          icon={<Scale className="w-5 h-5" />}
          accentColor="cyan"
        />

        <StatCard
          title="Landfill Diversion Rate"
          value={`${metrics.diversionRate}%`}
          subtitle={`${formatWeight(metrics.recyclableWeightKg, "auto")} recyclables saved`}
          icon={<Recycle className="w-5 h-5" />}
          accentColor="primary"
        />

        <StatCard
          title="Monthly Contract"
          value={formatCurrency(client.monthlyFee, client.currency || "KES")}
          subtitle={
            metrics.pendingInvoicesCount > 0
              ? `${metrics.pendingInvoicesCount} invoice pending payment`
              : "All invoices up to date"
          }
          icon={<DollarSign className="w-5 h-5" />}
          accentColor={metrics.pendingInvoicesCount > 0 ? "amber" : "neutral"}
        />
      </div>

      {/* 2 Column Operations & Invoicing Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Collections */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-card p-5 border border-[#E3E9E5] shadow-card-elevated">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F4F2] mb-3">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#00993F]" />
                <h3 className="text-sm font-bold text-slate-900">
                  Recent Collection Activity
                </h3>
              </div>
              <Link
                href="/portal/collections"
                className="text-xs font-bold text-[#00993F] hover:text-[#008235] flex items-center gap-1"
              >
                <span>View All History</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentCollections.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#E3E9E5] text-[#4B5563] font-semibold">
                      <th className="pb-2">Job Number</th>
                      <th className="pb-2">Date</th>
                      <th className="pb-2">Stream</th>
                      <th className="pb-2">Net Weight</th>
                      <th className="pb-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0F4F2]">
                    {recentCollections.map((job) => (
                      <tr key={job.id} className="hover:bg-[#F6F8F7]">
                        <td className="py-2.5 font-mono font-bold text-slate-800">
                          {job.jobNumber}
                        </td>
                        <td className="py-2.5 text-[#4B5563]">
                          {formatDate(job.scheduledAt)}
                        </td>
                        <td className="py-2.5 capitalize font-semibold text-slate-800">
                          {job.wasteStream}
                        </td>
                        <td className="py-2.5 font-mono font-bold text-[#00993F]">
                          {job.actualWeightKg
                            ? formatWeight(job.actualWeightKg, "kg")
                            : `~${formatWeight(job.expectedQuantityKg, "kg")}`}
                        </td>
                        <td className="py-2.5">
                          <Badge
                            variant={
                              job.status === "completed"
                                ? "primary"
                                : job.status === "scheduled"
                                ? "neutral"
                                : "cyan"
                            }
                            dot
                          >
                            {job.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-[#9CA3AF] py-6 text-center">
                No recent collections recorded yet.
              </p>
            )}
          </div>

          {/* Environmental Performance Snapshot */}
          <div className="bg-white rounded-card p-5 border border-[#E3E9E5] shadow-card-elevated">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F4F2] mb-3">
              <div className="flex items-center gap-2">
                <Leaf className="w-4 h-4 text-[#00993F]" />
                <h3 className="text-sm font-bold text-slate-900">
                  Sustainability & Diversion Highlights
                </h3>
              </div>
              <Link
                href="/portal/reports"
                className="text-xs font-bold text-[#00993F] hover:text-[#008235] flex items-center gap-1"
              >
                <span>Full ESG Report</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-[#EDF9F1] rounded-nested border border-[#ADE4C1]">
                <span className="text-[#00682B] block font-bold">Organic Waste Composted</span>
                <span className="text-lg font-black text-slate-900 mt-1 block">
                  {formatWeight(metrics.organicWeightKg, "auto")}
                </span>
                <p className="text-[11px] text-[#4B5563] mt-1">
                  Kitchen scraps converted into organic soil conditioner.
                </p>
              </div>

              <div className="p-3 bg-[#E8F8FA] rounded-nested border border-[#A5E7EE]">
                <span className="text-[#067A8A] block font-bold">Recyclables Diverted</span>
                <span className="text-lg font-black text-slate-900 mt-1 block">
                  {formatWeight(metrics.recyclableWeightKg, "auto")}
                </span>
                <p className="text-[11px] text-[#4B5563] mt-1">
                  Cardboard, PET plastic, and glass baled at MRF.
                </p>
              </div>

              <div className="p-3 bg-[#F0F4F2] rounded-nested border border-[#E3E9E5]">
                <span className="text-slate-700 block font-bold">Estimated GHG Avoided</span>
                <span className="text-lg font-black text-[#00993F] mt-1 block">
                  {(metrics.totalWeightKg * 0.00062).toFixed(2)} tCO₂e
                </span>
                <p className="text-[11px] text-[#4B5563] mt-1">
                  Calculated based on verified landfill diversion metrics.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Schedule & Invoicing Highlights */}
        <div className="space-y-6">
          {/* Service Configuration */}
          <div className="bg-white rounded-card p-5 border border-[#E3E9E5] shadow-card-elevated text-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-[#F0F4F2] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#00993F]" />
              Service Configuration
            </h3>

            <div>
              <span className="text-[#9CA3AF] block">Assigned Containers</span>
              <span className="font-semibold text-slate-800">{client.binCount}</span>
            </div>

            <div>
              <span className="text-[#9CA3AF] block">Pickup Frequency</span>
              <span className="font-semibold text-slate-800 capitalize">
                {client.collectionFrequency.replace("_", " ")}
              </span>
            </div>

            <div>
              <span className="text-[#9CA3AF] block">Waste Categories</span>
              <span className="font-semibold text-slate-800">{client.wasteStreams}</span>
            </div>

            <div>
              <span className="text-[#9CA3AF] block">Contract Validity</span>
              <span className="font-semibold text-slate-800">
                {formatDate(client.contractStartDate)} — {formatDate(client.contractEndDate)}
              </span>
            </div>
          </div>

          {/* Pending Invoices */}
          <div className="bg-white rounded-card p-5 border border-[#E3E9E5] shadow-card-elevated text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F4F2] mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#08A6BA]" />
                Recent Invoices
              </h3>
              <Link
                href="/portal/invoices"
                className="text-xs font-bold text-[#08A6BA] hover:underline"
              >
                All Invoices
              </Link>
            </div>

            {recentInvoices.length > 0 ? (
              <div className="space-y-3">
                {recentInvoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="p-3 rounded-nested bg-[#F6F8F7] border border-[#E3E9E5] flex items-center justify-between"
                  >
                    <div>
                      <span className="font-mono font-bold text-slate-900 block">
                        {inv.invoiceNumber}
                      </span>
                      <span className="text-[11px] text-[#4B5563]">{inv.billingPeriod}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-slate-900 block">
                        {formatCurrency(inv.amount, inv.currency)}
                      </span>
                      <Badge
                        variant={inv.status === "paid" ? "primary" : "amber"}
                        dot
                      >
                        {inv.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#9CA3AF] py-3 text-center">No invoices generated yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
