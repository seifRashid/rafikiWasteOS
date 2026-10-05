import React from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/server";
import { getClientCollectionHistory } from "@/server/db/client-portal-queries";
import { db } from "@/server/db";
import { clients } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import {
  Truck,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Scale,
  FileText,
  Camera,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatWeight, formatDate, formatDateTime } from "@/lib/utils";

interface PageProps {
  searchParams: Promise<{
    search?: string;
    status?: string;
    stream?: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function ClientCollectionsPage({ searchParams }: PageProps) {
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

  const params = await searchParams;
  const currentStatus = params.status || "all";
  const currentStream = params.stream || "all";
  const currentSearch = params.search || "";

  const jobs = await getClientCollectionHistory(activeClientId, {
    status: currentStatus,
    wasteStream: currentStream,
    search: currentSearch,
  });

  // Calculate totals
  let completedCount = 0;
  let scheduledCount = 0;
  let missedCount = 0;
  let totalWeightKg = 0;

  jobs.forEach((j) => {
    if (j.status === "completed" || j.status === "delivered") {
      completedCount++;
      totalWeightKg += parseFloat(j.actualWeightKg || j.expectedQuantityKg || "0");
    } else if (j.status === "scheduled" || j.status === "in_progress") {
      scheduledCount++;
    } else if (j.status === "missed") {
      missedCount++;
    }
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E3E9E5]">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Collection History
          </h1>
          <p className="text-xs text-[#4B5563] mt-1">
            Complete digital manifest of all waste pickups, weighbridge slips, and verification sheets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold bg-[#EDF9F1] text-[#00682B] px-3 py-1.5 rounded-nested border border-[#ADE4C1]">
            {jobs.length} Records Found
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-card p-4 border border-[#E3E9E5] shadow-card-elevated flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        {/* Search */}
        <form className="relative w-full md:w-72" method="GET">
          <input type="hidden" name="status" value={currentStatus} />
          <input type="hidden" name="stream" value={currentStream} />
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#9CA3AF]" />
          <input
            type="text"
            name="search"
            defaultValue={currentSearch}
            placeholder="Search job number, driver..."
            className="w-full pl-9 pr-4 py-2 rounded-nested bg-[#F6F8F7] border border-[#E3E9E5] text-xs text-slate-900 focus:outline-none focus:border-[#00993F]"
          />
        </form>

        {/* Quick Filter Links */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <span className="text-[#9CA3AF] font-bold">Status:</span>
          {["all", "completed", "scheduled", "missed"].map((s) => (
            <Link
              key={s}
              href={`/portal/collections?status=${s}&stream=${currentStream}&search=${encodeURIComponent(
                currentSearch
              )}`}
              className={`px-2.5 py-1 rounded-full capitalize font-semibold transition-colors ${
                currentStatus === s
                  ? "bg-[#00993F] text-white"
                  : "bg-[#F0F4F2] text-[#4B5563] hover:bg-[#E3E9E5]"
              }`}
            >
              {s}
            </Link>
          ))}

          <span className="text-[#9CA3AF] font-bold ml-2">Stream:</span>
          {["all", "organic", "recyclable"].map((st) => (
            <Link
              key={st}
              href={`/portal/collections?status=${currentStatus}&stream=${st}&search=${encodeURIComponent(
                currentSearch
              )}`}
              className={`px-2.5 py-1 rounded-full capitalize font-semibold transition-colors ${
                currentStream === st
                  ? "bg-[#08A6BA] text-white"
                  : "bg-[#F0F4F2] text-[#4B5563] hover:bg-[#E3E9E5]"
              }`}
            >
              {st}
            </Link>
          ))}
        </div>
      </div>

      {/* Manifest Data Table */}
      <div className="bg-white rounded-card p-5 border border-[#E3E9E5] shadow-card-elevated">
        {jobs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E3E9E5] text-[#4B5563] font-semibold">
                  <th className="pb-3">Job Number</th>
                  <th className="pb-3">Date & Time</th>
                  <th className="pb-3">Waste Stream</th>
                  <th className="pb-3">Net Weight</th>
                  <th className="pb-3">Driver / Crew</th>
                  <th className="pb-3">Bin Condition</th>
                  <th className="pb-3">Signature / Notes</th>
                  <th className="pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F4F2]">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-[#F6F8F7]">
                    <td className="py-3 font-mono font-bold text-slate-900">
                      {job.jobNumber}
                    </td>
                    <td className="py-3 text-[#4B5563]">
                      <div>{formatDate(job.scheduledAt)}</div>
                      <div className="text-[11px] text-[#9CA3AF]">
                        {new Date(job.scheduledAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </td>
                    <td className="py-3">
                      <span className="font-semibold capitalize text-slate-800">
                        {job.wasteStream}
                      </span>
                    </td>
                    <td className="py-3 font-mono font-bold text-[#00993F]">
                      {job.actualWeightKg
                        ? formatWeight(job.actualWeightKg, "kg")
                        : job.expectedQuantityKg
                        ? `~${formatWeight(job.expectedQuantityKg, "kg")}`
                        : "—"}
                    </td>
                    <td className="py-3 text-[#4B5563]">
                      {job.driverName || "Assigned Crew"}
                    </td>
                    <td className="py-3">
                      <span className="bg-[#F0F4F2] px-2 py-0.5 rounded text-[11px] font-semibold text-slate-700">
                        {job.binCondition || "Normal"}
                      </span>
                    </td>
                    <td className="py-3 text-[#4B5563] max-w-[240px]">
                      {job.clientSignatureName && (
                        <div className="font-semibold text-slate-800 text-[11px]">
                          Signed: {job.clientSignatureName}
                        </div>
                      )}
                      <p className="text-[11px] text-[#9CA3AF] truncate">
                        {job.notes || "Routine service run."}
                      </p>
                    </td>
                    <td className="py-3 text-right">
                      <Badge
                        variant={
                          job.status === "completed"
                            ? "primary"
                            : job.status === "delivered"
                            ? "cyan"
                            : job.status === "scheduled"
                            ? "neutral"
                            : "danger"
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
          <div className="py-12 text-center text-xs text-[#9CA3AF]">
            <Truck className="w-8 h-8 text-[#E3E9E5] mx-auto mb-2" />
            <p>No collection records match the selected filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
