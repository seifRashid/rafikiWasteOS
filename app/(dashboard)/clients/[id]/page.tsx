import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  Recycle,
  Scale,
  FileText,
  Download,
  CheckCircle2,
  Clock,
  Truck,
  Leaf,
  Layers,
} from "lucide-react";
import { getClientProfile } from "@/server/db/queries";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { formatCurrency, formatWeight, formatDate, formatDateTime } from "@/lib/utils";

interface ClientPageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export default async function ClientDetailPage({ params }: ClientPageProps) {
  const { id } = await params;
  const profile = await getClientProfile(id);

  if (!profile) {
    notFound();
  }

  const { client, jobs, invoices, stats } = profile;

  return (
    <div className="space-y-6">
      {/* Back link & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E3E9E5]">
        <div className="flex items-center gap-3">
          <Link
            href="/clients"
            className="w-8 h-8 rounded-full bg-white border border-[#E3E9E5] hover:bg-[#F0F4F2] flex items-center justify-center text-[#4B5563] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#00993F] bg-[#EDF9F1] px-2 py-0.5 rounded-full border border-[#ADE4C1]">
                {client.accountNumber}
              </span>
              <Badge variant="primary">{client.customerType}</Badge>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
              {client.name}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/impact"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-nested bg-[#EDF9F1] text-[#00682B] text-xs font-bold border border-[#ADE4C1] hover:bg-[#D3F3DE] transition-all"
          >
            <Leaf className="w-4 h-4" />
            <span>Generate ESG Certificate</span>
          </Link>

          <Link
            href="/collections"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-nested bg-[#00993F] text-white text-xs font-bold shadow-sm hover:bg-[#008235] transition-all"
          >
            <Truck className="w-4 h-4" />
            <span>Dispatch Pickup</span>
          </Link>
        </div>
      </div>

      {/* 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Pickups"
          value={stats.totalCollections}
          subtitle="All completed jobs"
          icon={<CheckCircle2 className="w-5 h-5" />}
          accentColor="primary"
        />

        <StatCard
          title="Tonnage Collected"
          value={formatWeight(stats.totalTonnageKg, "auto")}
          subtitle={`${formatWeight(stats.recyclableKg, "auto")} recyclables`}
          icon={<Scale className="w-5 h-5" />}
          accentColor="cyan"
        />

        <StatCard
          title="Diversion Rate"
          value={`${stats.diversionRate}%`}
          subtitle="Landfill diversion score"
          icon={<Recycle className="w-5 h-5" />}
          accentColor="primary"
        />

        <StatCard
          title="Monthly Contract"
          value={formatCurrency(client.monthlyFee, "KES")}
          subtitle={`Billed ${client.collectionFrequency.replace("_", " ")}`}
          icon={<DollarSign className="w-5 h-5" />}
          accentColor="neutral"
        />
      </div>

      {/* Client Overview Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Account Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-card p-5 border border-[#E3E9E5] shadow-card-elevated text-xs">
            <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-[#F0F4F2] mb-3">
              Account Information
            </h3>

            <div className="space-y-3 text-[#4B5563]">
              <div>
                <span className="text-[#9CA3AF] block">Contact Person</span>
                <span className="font-semibold text-slate-800">{client.contactPerson || "Operations Lead"}</span>
              </div>
              <div>
                <span className="text-[#9CA3AF] block">Phone</span>
                <span className="font-semibold text-slate-800">{client.phone}</span>
              </div>
              <div>
                <span className="text-[#9CA3AF] block">Email</span>
                <span className="font-semibold text-slate-800">{client.email || "No email on file"}</span>
              </div>
              <div>
                <span className="text-[#9CA3AF] block">Physical Location</span>
                <span className="font-semibold text-slate-800">
                  {client.physicalAddress}, {client.countyRegion}
                </span>
              </div>
              <div>
                <span className="text-[#9CA3AF] block">Assigned Containers</span>
                <span className="font-semibold text-slate-800">{client.binCount || "Standard 240L"}</span>
              </div>
              <div>
                <span className="text-[#9CA3AF] block">Contract Term</span>
                <span className="font-semibold text-slate-800">
                  {formatDate(client.contractStartDate)} — {formatDate(client.contractEndDate)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 2 Cols: Service History & Invoices */}
        <div className="lg:col-span-2 space-y-6">
          {/* Collection History */}
          <div className="bg-white rounded-card p-5 border border-[#E3E9E5] shadow-card-elevated">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F4F2] mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#00993F]" />
                Collection History & Digital Job Sheets ({jobs.length})
              </h3>
            </div>

            {jobs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#E3E9E5] text-[#4B5563] font-semibold">
                      <th className="pb-2">Job Number</th>
                      <th className="pb-2">Date & Time</th>
                      <th className="pb-2">Stream</th>
                      <th className="pb-2">Actual Weight</th>
                      <th className="pb-2">Driver</th>
                      <th className="pb-2 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0F4F2]">
                    {jobs.map((job) => (
                      <tr key={job.id} className="hover:bg-[#F6F8F7]">
                        <td className="py-2.5 font-mono font-bold text-slate-800">
                          {job.jobNumber}
                        </td>
                        <td className="py-2.5 text-[#4B5563]">
                          {formatDateTime(job.scheduledAt)}
                        </td>
                        <td className="py-2.5 capitalize font-semibold text-slate-800">
                          {job.wasteStream}
                        </td>
                        <td className="py-2.5 font-mono font-bold text-[#00993F]">
                          {job.actualWeightKg
                            ? formatWeight(job.actualWeightKg, "kg")
                            : `~${formatWeight(job.expectedQuantityKg, "kg")}`}
                        </td>
                        <td className="py-2.5 text-[#4B5563]">
                          {job.driverName || "Driver Assigned"}
                        </td>
                        <td className="py-2.5 text-right">
                          <Badge
                            variant={
                              job.status === "completed"
                                ? "primary"
                                : job.status === "delivered"
                                ? "cyan"
                                : "neutral"
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
              <p className="text-xs text-[#9CA3AF] py-4">No collection jobs logged yet for this account.</p>
            )}
          </div>

          {/* Invoices Ledger */}
          <div className="bg-white rounded-card p-5 border border-[#E3E9E5] shadow-card-elevated">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F4F2] mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#08A6BA]" />
                Billing Ledger & Invoices ({invoices.length})
              </h3>
            </div>

            {invoices.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#E3E9E5] text-[#4B5563] font-semibold">
                      <th className="pb-2">Invoice #</th>
                      <th className="pb-2">Period</th>
                      <th className="pb-2">Due Date</th>
                      <th className="pb-2">Amount</th>
                      <th className="pb-2">Payment Ref</th>
                      <th className="pb-2 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0F4F2]">
                    {invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-[#F6F8F7]">
                        <td className="py-2.5 font-mono font-bold text-slate-800">
                          {inv.invoiceNumber}
                        </td>
                        <td className="py-2.5 text-[#4B5563]">{inv.billingPeriod}</td>
                        <td className="py-2.5 text-[#4B5563]">{formatDate(inv.dueDate)}</td>
                        <td className="py-2.5 font-mono font-bold text-slate-900">
                          {formatCurrency(inv.amount, "KES")}
                        </td>
                        <td className="py-2.5 font-mono text-[11px] text-[#4B5563]">
                          {inv.paymentReference || "—"}
                        </td>
                        <td className="py-2.5 text-right">
                          <Badge
                            variant={
                              inv.status === "paid"
                                ? "primary"
                                : inv.status === "pending"
                                ? "amber"
                                : "danger"
                            }
                            dot
                          >
                            {inv.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-[#9CA3AF] py-4">No invoices generated yet for this account.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
