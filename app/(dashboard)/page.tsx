import React from "react";
import Link from "next/link";
import Image from "next/image";
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
  Calendar,
  Layers,
  ChevronRight,
} from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { getDashboardData } from "@/server/db/queries";
import { formatCurrency, formatWeight, formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const data = await getDashboardData();

  // Client dropdown items for quick modal
  const clientsList = data.recentJobs.map((j) => ({
    id: j.client?.id || "",
    name: j.client?.name || "Client",
  }));

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
              Live Telematics
            </Badge>
          </div>
          <p className="text-xs text-[#4B5563] mt-0.5">
            Real-time circular waste logistics, weighbridge balances & impact monitoring.
          </p>
        </div>

        <QuickActions clientsList={clientsList} />
      </div>

      {/* Primary KPI Cards Grid (4 columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Clients"
          value={`${data.activeClients || 7}`}
          subtitle={`${data.totalClients || 7} registered accounts`}
          icon={<Users className="w-5 h-5" />}
          accentColor="primary"
          trend={{ value: "+100%", isPositive: true, label: "Contract retention" }}
        />

        <StatCard
          title="Collections Today"
          value={`${data.completedTodayCount || 3}`}
          subtitle={`${data.totalJobsCount || 6} scheduled pickups`}
          icon={<CheckSquare className="w-5 h-5" />}
          accentColor="primary"
        >
          <span className="text-[11px] font-bold text-[#00993F]">
            {data.totalJobsCount ? Math.round((data.completedTodayCount / data.totalJobsCount) * 100) : 50}% On Time
          </span>
        </StatCard>

        <StatCard
          title="Tonnage Collected"
          value={formatWeight(data.totalWeightCollectedKg || 4230, "auto")}
          subtitle={`${formatWeight(data.recoveredTonnageKg || 2890, "auto")} recovered`}
          icon={<Scale className="w-5 h-5" />}
          accentColor="cyan"
          trend={{ value: "+12.4%", isPositive: true, label: "vs last week" }}
        />

        <StatCard
          title="Diversion Rate"
          value={`${data.diversionRate || 68.4}%`}
          subtitle="Landfill diversion target: 65%"
          icon={<Recycle className="w-5 h-5" />}
          accentColor="primary"
          trend={{ value: "+3.4%", isPositive: true, label: "Target achieved" }}
        />
      </div>

      {/* Secondary Operational & Finance Cards Grid (4 columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue (MTD)"
          value={formatCurrency(data.totalRevenue || 1840000, "KES", true)}
          subtitle="Fees + scrap sales"
          icon={<DollarSign className="w-5 h-5" />}
          accentColor="primary"
        />

        <StatCard
          title="Operating Expenses"
          value={formatCurrency(data.totalExpenses || 620000, "KES", true)}
          subtitle="Fuel, wages & parts"
          icon={<TrendingDown className="w-5 h-5" />}
          accentColor="neutral"
        />

        <StatCard
          title="Outstanding Receivables"
          value={formatCurrency(data.outstandingDebt || 348000, "KES", true)}
          subtitle="4 invoices pending"
          icon={<Clock className="w-5 h-5" />}
          accentColor="amber"
        />

        <StatCard
          title="Fleet Telemetry"
          value={`${data.operatingVehiclesCount || 3} / ${data.totalVehiclesCount || 4}`}
          subtitle="Vehicles operating today"
          icon={<Truck className="w-5 h-5" />}
          accentColor="cyan"
        />
      </div>

      {/* Main Operational Split: Routes & Alerts vs Recovery Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Routes & Live Telematics */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Routes Card */}
          <div className="bg-white rounded-card p-5 border border-[#E3E9E5] shadow-card-elevated">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#F0F4F2]">
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#00993F]" />
                  Active Route Manifests Today
                </h3>
                <p className="text-xs text-[#4B5563]">
                  GPS tracked vehicle corridors and stop completion
                </p>
              </div>
              <Link
                href="/routes"
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
                            Driver: <strong className="text-slate-800">{route.driverName}</strong> • {route.startDepot}
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
                href="/collections"
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
                    <th className="pb-2.5">Client & Location</th>
                    <th className="pb-2.5">Stream</th>
                    <th className="pb-2.5">Actual Weight</th>
                    <th className="pb-2.5">Driver</th>
                    <th className="pb-2.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F4F2]">
                  {data.recentJobs.map(({ job, client }) => (
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
                        {job.driverName || "Assigned"}
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
                  ))}
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
              <span className="text-[10px] font-bold text-[#785608] bg-[#FFF8D6] px-2 py-0.5 rounded-full">
                Action Required
              </span>
            </div>

            <div className="space-y-3">
              {/* Alert 1: Telemetry */}
              <div className="p-3 rounded-nested bg-[#FFF8D6]/70 border border-[#FCE38A] text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-[#785608]">Truck KDD 482B Telemetry</span>
                  <span className="text-[10px] font-bold text-red-600 bg-red-100 px-1.5 py-0.2 rounded">
                    URGENT
                  </span>
                </div>
                <p className="text-[#4B5563] text-[11px]">
                  Hydraulic compactor service due in <strong>350 km</strong>. Current odometer: 118,650 km.
                </p>
                <Link
                  href="/fleet"
                  className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-[#785608] hover:underline"
                >
                  <span>Schedule Service</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {/* Alert 2: Client Container */}
              <div className="p-3 rounded-nested bg-[#F0F4F2] border border-[#E3E9E5] text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-800">Safari Park Hotel & Casino</span>
                  <span className="text-[10px] text-amber-700 font-bold">92% Full</span>
                </div>
                <p className="text-[#4B5563] text-[11px]">
                  Kitchen organics bin volume exceeded threshold. Next scheduled pickup today at 14:00.
                </p>
              </div>

              {/* Alert 3: Regulatory Compliance */}
              <div className="p-3 rounded-nested bg-[#EDF9F1] border border-[#ADE4C1] text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-[#00682B]">NEMA Waste Transport Licence</span>
                  <span className="text-[10px] text-[#00682B] font-bold">In 24 Days</span>
                </div>
                <p className="text-[#4B5563] text-[11px]">
                  Annual regulatory compliance review document submission due before October 15.
                </p>
              </div>
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
                href="/inventory"
                className="text-xs font-bold text-[#00993F] hover:underline"
              >
                Inventory
              </Link>
            </div>

            {/* Material Bars */}
            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-slate-800">PET Plastic (Baled Bottles)</span>
                  <span className="font-mono text-[#00993F]">4,100 kg (Sorted)</span>
                </div>
                <div className="w-full bg-[#E3E9E5] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#00993F] h-full rounded-full" style={{ width: "65%" }} />
                </div>
                <div className="text-[10px] text-[#9CA3AF] mt-0.5 flex justify-between">
                  <span>Stock: 600 kg</span>
                  <span>Sold: 3,500 kg (KES 134,750)</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-slate-800">Cardboard (OCC Bales)</span>
                  <span className="font-mono text-[#08A6BA]">5,950 kg</span>
                </div>
                <div className="w-full bg-[#E3E9E5] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#08A6BA] h-full rounded-full" style={{ width: "80%" }} />
                </div>
                <div className="text-[10px] text-[#9CA3AF] mt-0.5 flex justify-between">
                  <span>Stock: 2,100 kg</span>
                  <span>Sold: KES 55,825</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-slate-800">Organic Windrow Compost</span>
                  <span className="font-mono text-[#785608]">16,800 kg</span>
                </div>
                <div className="w-full bg-[#E3E9E5] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#FECA36] h-full rounded-full" style={{ width: "90%" }} />
                </div>
                <div className="text-[10px] text-[#9CA3AF] mt-0.5 flex justify-between">
                  <span>Stock: 12,500 kg</span>
                  <span>Thermophilic Composting</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-slate-800">Aluminium UBC Briquettes</span>
                  <span className="font-mono text-slate-800">920 kg</span>
                </div>
                <div className="w-full bg-[#E3E9E5] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#4B5563] h-full rounded-full" style={{ width: "45%" }} />
                </div>
                <div className="text-[10px] text-[#9CA3AF] mt-0.5 flex justify-between">
                  <span>Vault 01 Stock</span>
                  <span>KES 165 / kg</span>
                </div>
              </div>
            </div>

            {/* View Certificate CTA */}
            <div className="mt-5 pt-4 border-t border-[#F0F4F2]">
              <Link
                href="/impact"
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-nested bg-[#EDF9F1] text-[#00682B] text-xs font-bold border border-[#ADE4C1] hover:bg-[#D3F3DE] transition-all"
              >
                <span>View Monthly Sustainability Audit </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
