import React from "react";
import Link from "next/link";
import {
  Users,
  CheckSquare,
  Scale,
  Recycle,
  DollarSign,
  TrendingDown,
  Clock,
  Truck,
  AlertTriangle,
  ArrowRight,
  MapPin,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { getDashboardData, getWasteMaterials } from "@/server/db/queries";
import { formatCurrency, formatWeight } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [data, materialsList] = await Promise.all([
    getDashboardData(),
    getWasteMaterials(),
  ]);

  const activeClientPct =
    data.totalClients > 0 ? Math.round((data.activeClients / data.totalClients) * 100) : 0;

  const jobCompletionPct =
    data.totalJobsCount > 0
      ? Math.round((data.completedJobsCount / data.totalJobsCount) * 100)
      : 0;

  const fleetActivePct =
    data.totalVehiclesCount > 0
      ? Math.round((data.operatingVehiclesCount / data.totalVehiclesCount) * 100)
      : 0;

  // Group live recyclable inventory batches by material type
  const materialMap = new Map<
    string,
    { materialType: string; totalKg: number; stockKg: number; revenue: number }
  >();

  data.inventoryBatches.forEach((batch) => {
    const key = batch.materialType || "Other";
    const existing = materialMap.get(key) || {
      materialType: key,
      totalKg: 0,
      stockKg: 0,
      revenue: 0,
    };
    existing.totalKg += parseFloat(batch.sortedWeightKg || batch.collectedWeightKg || "0");
    existing.stockKg += parseFloat(batch.currentWeightKg || "0");
    existing.revenue += parseFloat(batch.totalRevenue || "0");
    materialMap.set(key, existing);
  });

  const materialBreakdown = Array.from(materialMap.values())
    .sort((a, b) => b.totalKg - a.totalKg)
    .slice(0, 5);

  const maxMaterialKg = materialBreakdown[0]?.totalKg || 1;
  const barColors = [
    "bg-[#00993F]",
    "bg-[#08A6BA]",
    "bg-[#FECA36]",
    "bg-[#4B5563]",
    "bg-[#00682B]",
  ];

  // Build real operational alerts from live database state
  const operationalAlerts: {
    id: string;
    title: string;
    badge: string;
    description: string;
    href: string;
    cta: string;
    tone: "amber" | "neutral" | "primary";
  }[] = [];

  if (data.missedJobsCount > 0) {
    operationalAlerts.push({
      id: "missed-jobs",
      title: "Missed Collection Jobs",
      badge: `${data.missedJobsCount} MISSED`,
      description: `${data.missedJobsCount} scheduled collection ${
        data.missedJobsCount === 1 ? "job requires" : "jobs require"
      } rescheduling or follow-up.`,
      href: "/operations/collections",
      cta: "Open Dispatch Board",
      tone: "amber",
    });
  }

  if (data.pendingInvoicesCount > 0) {
    operationalAlerts.push({
      id: "pending-invoices",
      title: "Pending Client Receivables",
      badge:
        data.overdueInvoicesCount > 0
          ? `${data.overdueInvoicesCount} OVERDUE`
          : `${data.pendingInvoicesCount} PENDING`,
      description: `${formatCurrency(data.outstandingDebt, "KES")} outstanding across ${
        data.pendingInvoicesCount
      } unpaid ${data.pendingInvoicesCount === 1 ? "invoice" : "invoices"}.`,
      href: "/finance/invoices",
      cta: "Review Invoices",
      tone: data.overdueInvoicesCount > 0 ? "amber" : "neutral",
    });
  }

  data.serviceAlerts.slice(0, 2).forEach((v) => {
    const remainingKm = v.nextServiceKm - v.currentMileageKm;
    operationalAlerts.push({
      id: `vehicle-${v.id}`,
      title: `Vehicle ${v.plateNumber} Service`,
      badge: "DUE SOON",
      description: `Service due in ${remainingKm.toLocaleString()} km (Odometer: ${v.currentMileageKm.toLocaleString()} km).`,
      href: "/fleet",
      cta: "View Fleet",
      tone: "amber",
    });
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E3E9E5]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Command Centre
            </h1>
            <Badge variant="primary" dot>
              Live Database
            </Badge>
          </div>
          <p className="text-xs text-[#4B5563] mt-0.5">
            Real-time circular waste logistics, weighbridge balances &amp; impact monitoring.
          </p>
        </div>

        <QuickActions clientsList={data.clientsList} materialsList={materialsList} />
      </div>

      {/* Primary KPI Cards Grid (4 columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Clients"
          value={`${data.activeClients}`}
          subtitle={`${data.totalClients} registered ${data.totalClients === 1 ? "account" : "accounts"}`}
          icon={<Users className="w-5 h-5 text-slate-800" />}
          accentColor="primary"
          trend={
            data.totalClients > 0
              ? { value: `${activeClientPct}%`, isPositive: true, label: "Active rate" }
              : undefined
          }
        />

        <StatCard
          title="Collection Jobs"
          value={`${data.completedJobsCount} / ${data.totalJobsCount}`}
          subtitle={`${data.completedTodayCount} completed today`}
          icon={<CheckSquare className="w-5 h-5 text-slate-800" />}
          accentColor="cyan"
          trend={
            data.totalJobsCount > 0
              ? {
                  value: `${jobCompletionPct}%`,
                  isPositive: jobCompletionPct >= 50,
                  label: "Completed",
                }
              : undefined
          }
        />

        <StatCard
          title="Tonnage Collected"
          value={formatWeight(data.totalWeightCollectedKg, "auto")}
          subtitle={`${formatWeight(data.recoveredTonnageKg, "auto")} sorted in inventory`}
          icon={<Scale className="w-5 h-5 text-slate-800" />}
          accentColor="blue"
        />

        <StatCard
          title="Diversion Rate"
          value={`${data.diversionRate}%`}
          subtitle="Landfill diversion target: 65%"
          icon={<Recycle className="w-5 h-5 text-slate-800" />}
          accentColor={data.diversionRate >= 65 ? "primary" : "amber"}
          trend={
            data.totalWeightCollectedKg > 0
              ? {
                  value: data.diversionRate >= 65 ? "On Target" : "Below Target",
                  isPositive: data.diversionRate >= 65,
                }
              : undefined
          }
        />
      </div>

      {/* Secondary Operational & Finance Cards Grid (4 columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue Collected"
          value={formatCurrency(data.totalRevenue, "KES", true)}
          subtitle="Paid invoices + scrap sales"
          icon={<DollarSign className="w-5 h-5 text-slate-800" />}
          accentColor="primary"
        />

        <StatCard
          title="Operating Expenses"
          value={formatCurrency(data.totalExpenses, "KES", true)}
          subtitle="Logged operational spend"
          icon={<TrendingDown className="w-5 h-5 text-slate-800" />}
          accentColor="purple"
        />

        <StatCard
          title="Outstanding Receivables"
          value={formatCurrency(data.outstandingDebt, "KES", true)}
          subtitle={`${data.pendingInvoicesCount} ${
            data.pendingInvoicesCount === 1 ? "invoice" : "invoices"
          } pending`}
          icon={<Clock className="w-5 h-5 text-slate-800" />}
          accentColor="amber"
        />

        <StatCard
          title="Fleet Telemetry"
          value={`${data.operatingVehiclesCount} / ${data.totalVehiclesCount}`}
          subtitle="Vehicles active in registry"
          icon={<Truck className="w-5 h-5 text-slate-800" />}
          accentColor="cyan"
          trend={
            data.totalVehiclesCount > 0
              ? {
                  value: `${fleetActivePct}%`,
                  isPositive: fleetActivePct > 0,
                  label: "Active",
                }
              : undefined
          }
        />
      </div>

      {/* Main Operational Split: Routes & Alerts vs Recovery Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Routes & Live Collections */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Routes Card */}
          <div className="bg-white rounded-card p-5 border border-[#E3E9E5] shadow-card-elevated">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#F0F4F2]">
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#00993F]" />
                  Active Route Manifests
                </h3>
                <p className="text-xs text-[#4B5563]">
                  Tracked vehicle corridors and stop completion
                </p>
              </div>
              <Link
                href="/operations/routes"
                className="text-xs font-bold text-[#00993F] hover:text-[#008235] flex items-center gap-1"
              >
                <span>View All Routes</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3.5">
              {data.activeRoutes && data.activeRoutes.length > 0 ? (
                data.activeRoutes.map((route) => {
                  const percent =
                    route.totalStops > 0
                      ? Math.round((route.completedStops / route.totalStops) * 100)
                      : 0;

                  return (
                    <div
                      key={route.id}
                      className="p-3.5 rounded-nested bg-[#F6F8F7] border border-[#E3E9E5] hover:border-[#ADE4C1] transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-[#111827]">
                              {route.routeCode}
                            </span>
                            <span className="text-xs font-bold text-slate-800">
                              {route.name}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#4B5563] mt-0.5">
                            Driver: <strong className="text-slate-800">{route.driverName || "Unassigned"}</strong> • {route.startDepot}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge
                            variant={
                              route.status === "completed"
                                ? "primary"
                                : route.status === "in_progress"
                                ? "cyan"
                                : "neutral"
                            }
                            dot
                          >
                            {route.status.replace("_", " ").toUpperCase()}
                          </Badge>
                          <span className="font-mono text-xs font-bold text-slate-700">
                            {route.completedStops} / {route.totalStops} stops
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-[#E3E9E5] h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[#00993F] h-full rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-[#9CA3AF]">No active routes scheduled.</p>
              )}
            </div>
          </div>

          {/* Live Collections Feed */}
          <div className="bg-white rounded-card p-5 border border-[#E3E9E5] shadow-card-elevated">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#F0F4F2]">
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-[#08A6BA]" />
                  Recent Digital Collection Jobs
                </h3>
                <p className="text-xs text-[#4B5563]">
                  Live status updates from field drivers and weighbridge depot
                </p>
              </div>
              <Link
                href="/operations/collections"
                className="text-xs font-bold text-[#08A6BA] hover:text-[#068A9B] flex items-center gap-1"
              >
                <span>Live Dispatch Board</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E3E9E5] text-[#4B5563] font-semibold">
                    <th className="pb-2.5">Job ID</th>
                    <th className="pb-2.5">Client &amp; Location</th>
                    <th className="pb-2.5">Stream</th>
                    <th className="pb-2.5">Weight</th>
                    <th className="pb-2.5">Driver</th>
                    <th className="pb-2.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F4F2]">
                  {data.recentJobs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-[#9CA3AF]">
                        No collection jobs recorded yet.
                      </td>
                    </tr>
                  ) : (
                    data.recentJobs.map(({ job, client }) => (
                      <tr key={job.id} className="hover:bg-[#F6F8F7] transition-colors">
                        <td className="py-3 font-mono font-bold text-slate-800">
                          {job.jobNumber}
                        </td>
                        <td className="py-3">
                          <div className="font-bold text-slate-900">{client?.name || "Client"}</div>
                          <div className="text-[11px] text-[#4B5563] truncate max-w-[180px]">
                            {client?.physicalAddress}
                          </div>
                        </td>
                        <td className="py-3 capitalize">
                          <Badge
                            variant={
                              job.wasteStream === "organic"
                                ? "amber"
                                : job.wasteStream === "recyclable"
                                ? "primary"
                                : "neutral"
                            }
                          >
                            {job.wasteStream}
                          </Badge>
                        </td>
                        <td className="py-3 font-mono font-bold text-slate-800">
                          {job.actualWeightKg
                            ? formatWeight(job.actualWeightKg, "kg")
                            : `~${formatWeight(job.expectedQuantityKg, "kg")}`}
                        </td>
                        <td className="py-3 text-[#4B5563]">
                          {job.driverName || "Unassigned"}
                        </td>
                        <td className="py-3 text-right">
                          <Badge
                            variant={
                              job.status === "completed"
                                ? "primary"
                                : job.status === "delivered"
                                ? "cyan"
                                : job.status === "collected" || job.status === "in_progress"
                                ? "amber"
                                : "neutral"
                            }
                            dot
                          >
                            {job.status.replace("_", " ")}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Operational Alerts & Recovery Breakdown */}
        <div className="space-y-6">
          {/* Key Alerts Widget */}
          <div className="bg-white rounded-card p-5 border border-[#E3E9E5] shadow-card-elevated">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F4F2] mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#FECA36]" />
                Operational Alerts
              </h3>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  operationalAlerts.length > 0
                    ? "text-[#785608] bg-[#FFF8D6]"
                    : "text-[#00682B] bg-[#EDF9F1]"
                }`}
              >
                {operationalAlerts.length > 0 ? `${operationalAlerts.length} Active` : "All Clear"}
              </span>
            </div>

            <div className="space-y-3">
              {operationalAlerts.length === 0 ? (
                <div className="p-3.5 rounded-nested bg-[#EDF9F1] border border-[#ADE4C1] text-xs flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#00993F] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-[#00682B]">All systems normal</p>
                    <p className="text-[#4B5563] text-[11px] mt-0.5">
                      No missed collections, overdue invoices, or urgent service alerts.
                    </p>
                  </div>
                </div>
              ) : (
                operationalAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-nested border text-xs ${
                      alert.tone === "amber"
                        ? "bg-[#FFF8D6]/70 border-[#FCE38A]"
                        : "bg-[#F0F4F2] border-[#E3E9E5]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1 gap-2">
                      <span
                        className={`font-bold ${
                          alert.tone === "amber" ? "text-[#785608]" : "text-slate-800"
                        }`}
                      >
                        {alert.title}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                          alert.tone === "amber"
                            ? "text-[#785608] bg-[#FECA36]/40"
                            : "text-slate-700 bg-white"
                        }`}
                      >
                        {alert.badge}
                      </span>
                    </div>
                    <p className="text-[#4B5563] text-[11px]">{alert.description}</p>
                    <Link
                      href={alert.href}
                      className={`mt-2 inline-flex items-center gap-1 text-[11px] font-bold hover:underline ${
                        alert.tone === "amber" ? "text-[#785608]" : "text-[#00993F]"
                      }`}
                    >
                      <span>{alert.cta}</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recyclables Material Breakdown Card */}
          <div className="bg-white rounded-card p-5 border border-[#E3E9E5] shadow-card-elevated">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F4F2] mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Recycle className="w-4 h-4 text-[#00993F]" />
                Recovered Stream Balance
              </h3>
              <Link
                href="/waste/inventory"
                className="text-xs font-bold text-[#00993F] hover:underline"
              >
                Inventory
              </Link>
            </div>

            {/* Live Material Bars */}
            <div className="space-y-3 text-xs">
              {materialBreakdown.length === 0 ? (
                <p className="text-xs text-[#9CA3AF] py-2">
                  No sorted recyclable batches recorded in inventory yet.
                </p>
              ) : (
                materialBreakdown.map((item, idx) => {
                  const widthPct = Math.max(
                    6,
                    Math.round((item.totalKg / maxMaterialKg) * 100)
                  );
                  return (
                    <div key={item.materialType}>
                      <div className="flex justify-between font-semibold mb-1">
                        <span className="text-slate-800">{item.materialType}</span>
                        <span className="font-mono text-[#00993F]">
                          {formatWeight(item.totalKg, "kg")}
                        </span>
                      </div>
                      <div className="w-full bg-[#E3E9E5] h-2 rounded-full overflow-hidden">
                        <div
                          className={`${barColors[idx % barColors.length]} h-full rounded-full`}
                          style={{ width: `${widthPct}%` }}
                        />
                      </div>
                      <div className="text-[10px] text-[#9CA3AF] mt-0.5 flex justify-between">
                        <span>In Stock: {formatWeight(item.stockKg, "kg")}</span>
                        <span>
                          {item.revenue > 0
                            ? `Sales: ${formatCurrency(item.revenue, "KES")}`
                            : "Awaiting sale"}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* View Certificate CTA */}
            <div className="mt-5 pt-4 border-t border-[#F0F4F2]">
              <Link
                href="/impact"
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-nested bg-[#EDF9F1] text-[#00682B] text-xs font-bold border border-[#ADE4C1] hover:bg-[#D3F3DE] transition-all"
              >
                <span>View Monthly Sustainability Audit</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
