import React from "react";
import { Scale, CheckCircle2, FileText, Camera } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getCollectionJobsWithDetails } from "@/server/db/queries";
import { formatWeight, formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function WasteRecordsPage() {
  const jobs = await getCollectionJobsWithDetails();
  const weighedJobs = jobs.filter((j) => j.job.actualWeightKg !== null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E3E9E5]">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Certified Waste & Weighbridge Records
          </h1>
          <p className="text-xs text-[#4B5563] mt-0.5">
            Immutable intake tickets recorded on depot Avery Berkel digital weighbridge scales.
          </p>
        </div>

        <Badge variant="primary" dot>
          KEBS Calibrated IP Scale
        </Badge>
      </div>

      <div className="bg-white rounded-card border border-[#E3E9E5] shadow-card-elevated overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F6F8F7] border-b border-[#E3E9E5]">
              <tr className="text-[#4B5563] font-semibold">
                <th className="py-3 px-4">Ticket / Job</th>
                <th className="py-3 px-4">Client Source</th>
                <th className="py-3 px-4">Stream</th>
                <th className="py-3 px-4">Gross Scale</th>
                <th className="py-3 px-4">Truck Tare</th>
                <th className="py-3 px-4">Net Intake</th>
                <th className="py-3 px-4">Delivered Time</th>
                <th className="py-3 px-4 text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F4F2]">
              {weighedJobs.map(({ job, client, vehicle }) => (
                <tr key={job.id} className="hover:bg-[#F6F8F7] transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    {job.jobNumber}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-900 block">{client?.name || "Client"}</span>
                    <span className="text-[11px] text-[#9CA3AF]">{client?.countyRegion}</span>
                  </td>

                  <td className="py-3.5 px-4 capitalize">
                    <Badge variant={job.wasteStream === "organic" ? "amber" : "primary"}>
                      {job.wasteStream}
                    </Badge>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-slate-700">
                    {job.grossWeightKg ? formatWeight(job.grossWeightKg, "kg") : "—"}
                  </td>

                  <td className="py-3.5 px-4 font-mono text-slate-700">
                    {job.tareWeightKg ? formatWeight(job.tareWeightKg, "kg") : "—"}
                  </td>

                  <td className="py-3.5 px-4 font-mono font-extrabold text-[#00993F]">
                    {formatWeight(job.actualWeightKg, "kg")}
                  </td>

                  <td className="py-3.5 px-4 text-[#4B5563]">
                    {formatDateTime(job.deliveredAt || job.scheduledAt)}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#00682B]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#00993F]" />
                      <span>Certified</span>
                    </span>
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
