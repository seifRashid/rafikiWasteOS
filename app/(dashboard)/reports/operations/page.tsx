import React from "react";
import { BarChart3, Download, Truck, CheckCircle2, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getRoutesWithAssignments } from "@/server/db/queries";

export const dynamic = "force-dynamic";

export default async function ReportsOperationsPage() {
  const routes = await getRoutesWithAssignments();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E3E9E5]">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Operations & Route Performance Reports
          </h1>
          <p className="text-xs text-[#4B5563] mt-0.5">
            Daily collection logs, stop completion rates, driver timeliness and distance analytics.
          </p>
        </div>

        <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-nested bg-[#00993F] text-white text-xs font-semibold shadow-sm hover:bg-[#008235]">
          <Download className="w-3.5 h-3.5" />
          <span>Export Manifest CSV</span>
        </button>
      </div>

      <div className="bg-white rounded-card border border-[#E3E9E5] shadow-card-elevated overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F6F8F7] border-b border-[#E3E9E5]">
              <tr className="text-[#4B5563] font-semibold">
                <th className="py-3 px-4">Route Code</th>
                <th className="py-3 px-4">Route Name</th>
                <th className="py-3 px-4">Driver & Vehicle</th>
                <th className="py-3 px-4">Stops Completed</th>
                <th className="py-3 px-4">Odometer Logged</th>
                <th className="py-3 px-4 text-right">Performance Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F4F2]">
              {routes.map(({ route, vehicle }) => (
                <tr key={route.id} className="hover:bg-[#F6F8F7] transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    {route.routeCode}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{route.name}</td>
                  <td className="py-3.5 px-4 text-[#4B5563]">
                    {route.driverName} ({vehicle?.plateNumber || "Truck"})
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                    {route.completedStops} / {route.totalStops} stops
                  </td>
                  <td className="py-3.5 px-4 text-[#4B5563] font-mono">
                    {route.totalDistanceKm} km
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Badge variant="primary" dot>
                      94% On-Time
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
