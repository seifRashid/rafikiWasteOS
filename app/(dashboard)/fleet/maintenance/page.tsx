import React from "react";
import { getFleetAndAssets } from "@/server/db/queries";
import { Wrench, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function FleetMaintenancePage() {
  const { vehicles } = await getFleetAndAssets();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E3E9E5]">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Fleet Maintenance & Inspection Alerts
          </h1>
          <p className="text-xs text-[#4B5563] mt-0.5">
            Predictive maintenance alerts, hydraulic cylinder repairs, and statutory safety inspections.
          </p>
        </div>

        <Badge variant="amber" dot>
          1 Urgent Service Due in 350 km
        </Badge>
      </div>

      <div className="space-y-4">
        {vehicles.map((v) => {
          const kmToService = v.nextServiceKm - v.currentMileageKm;
          const isUrgent = kmToService <= 500 && kmToService > 0;

          return (
            <div
              key={v.id}
              className={`p-5 rounded-card bg-white border shadow-card-hoverable ${
                isUrgent ? "border-[#FCE38A] ring-1 ring-[#FECA36]" : "border-[#E3E9E5]"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#F0F4F2]">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-extrabold text-slate-900">
                    {v.plateNumber}
                  </span>
                  <span className="text-xs text-[#4B5563]">({v.model})</span>
                </div>

                <Badge variant={isUrgent ? "amber" : "primary"} dot>
                  {isUrgent ? `Service Due in ${kmToService} km` : "Inspection OK"}
                </Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 text-xs">
                <div className="p-3 rounded-nested bg-[#F6F8F7] border border-[#E3E9E5]">
                  <span className="text-[#9CA3AF] block font-medium">Current Odometer</span>
                  <span className="font-mono text-base font-bold text-slate-800 block mt-0.5">
                    {v.currentMileageKm.toLocaleString()} km
                  </span>
                </div>

                <div className="p-3 rounded-nested bg-[#F6F8F7] border border-[#E3E9E5]">
                  <span className="text-[#9CA3AF] block font-medium">Next Service Target</span>
                  <span className="font-mono text-base font-bold text-slate-800 block mt-0.5">
                    {v.nextServiceKm.toLocaleString()} km
                  </span>
                </div>

                <div className="p-3 rounded-nested bg-[#F6F8F7] border border-[#E3E9E5]">
                  <span className="text-[#9CA3AF] block font-medium">Service Interval</span>
                  <span className="font-mono text-base font-bold text-[#00993F] block mt-0.5">
                    10,000 km standard
                  </span>
                </div>

                <div className="p-3 rounded-nested bg-[#F6F8F7] border border-[#E3E9E5]">
                  <span className="text-[#9CA3AF] block font-medium">Assigned Driver</span>
                  <span className="text-xs font-bold text-slate-800 block mt-0.5">
                    {v.assignedDriverName || "Mohammed Bakari"}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
