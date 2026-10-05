import React from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/server";
import { getClientPortalDashboard } from "@/server/db/client-portal-queries";
import { db } from "@/server/db";
import { clients } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import {
  Calendar,
  Clock,
  Truck,
  AlertCircle,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Layers,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ClientSchedulePage() {
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
  if (!dashboardData) return null;

  const { client, recentCollections } = dashboardData;

  const upcomingRuns = recentCollections.filter(
    (j) => j.status === "scheduled" || j.status === "assigned"
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E3E9E5]">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Pickup Schedule & Dispatch Plan
          </h1>
          <p className="text-xs text-[#4B5563] mt-1">
            Service intervals, recurring collection days, and upcoming vehicle arrivals.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="primary" className="text-xs capitalize">
            {client.collectionFrequency.replace("_", " ")} Schedule
          </Badge>
        </div>
      </div>

      {/* Grid: Schedule Summary & Instructions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Routine Overview */}
        <div className="bg-white rounded-card p-5 border border-[#E3E9E5] shadow-card-elevated space-y-3 text-xs">
          <div className="flex items-center gap-2 pb-2 border-b border-[#F0F4F2]">
            <Calendar className="w-4 h-4 text-[#00993F]" />
            <h3 className="text-sm font-bold text-slate-900">Contract Frequency</h3>
          </div>

          <div>
            <span className="text-[#9CA3AF] block">Assigned Service Interval</span>
            <span className="font-bold text-base text-slate-900 capitalize">
              {client.collectionFrequency.replace("_", " ")}
            </span>
          </div>

          <div>
            <span className="text-[#9CA3AF] block">Designated Waste Streams</span>
            <span className="font-semibold text-slate-800">{client.wasteStreams}</span>
          </div>

          <div>
            <span className="text-[#9CA3AF] block">Registered On-Site Bins</span>
            <span className="font-semibold text-slate-800">{client.binCount}</span>
          </div>

          <div className="pt-2 border-t border-[#F0F4F2]">
            <span className="text-[11px] text-[#00993F] font-bold">
              ✓ Active route manifest confirmed
            </span>
          </div>
        </div>

        {/* Card 2: Setout Protocol */}
        <div className="bg-white rounded-card p-5 border border-[#E3E9E5] shadow-card-elevated space-y-3 text-xs">
          <div className="flex items-center gap-2 pb-2 border-b border-[#F0F4F2]">
            <Clock className="w-4 h-4 text-[#08A6BA]" />
            <h3 className="text-sm font-bold text-slate-900">Setout Protocol</h3>
          </div>

          <div className="space-y-2 text-[#4B5563]">
            <div className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-[#EDF9F1] text-[#00993F] font-bold flex items-center justify-center shrink-0 text-[10px]">
                1
              </span>
              <p>Place color-coded bins at the designated receiving bay by <strong>06:30 AM</strong>.</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-[#EDF9F1] text-[#00993F] font-bold flex items-center justify-center shrink-0 text-[10px]">
                2
              </span>
              <p>Keep food/organic waste separate from cardboard and beverage glass.</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-[#EDF9F1] text-[#00993F] font-bold flex items-center justify-center shrink-0 text-[10px]">
                3
              </span>
              <p>Ensure vehicle access gate is unlocked for the compactor truck.</p>
            </div>
          </div>
        </div>

        {/* Card 3: Ad-Hoc Request */}
        <div className="bg-[#EDF9F1] rounded-card p-5 border border-[#ADE4C1] space-y-3 text-xs">
          <h3 className="text-sm font-bold text-[#00682B] flex items-center gap-2">
            <Truck className="w-4 h-4" />
            Extra / Emergency Run?
          </h3>
          <p className="text-[#4B5563] text-[11px] leading-relaxed">
            Hosting an event, banquet, or seasonal clean-up generating overflow waste? Contact our
            dispatch team for an additional unscheduled pickup.
          </p>

          <div className="pt-2 border-t border-[#ADE4C1]/60 space-y-1 font-semibold text-slate-800 text-[11px]">
            <div>📞 Direct: +254 700 800 900</div>
            <div>✉️ dispatch@rafikiwaste.co.ke</div>
          </div>
        </div>
      </div>

      {/* Upcoming Dispatch Queue */}
      <div className="bg-white rounded-card p-5 border border-[#E3E9E5] shadow-card-elevated">
        <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-[#F0F4F2] mb-3 flex items-center gap-2">
          <Truck className="w-4 h-4 text-[#00993F]" />
          Upcoming Scheduled Pickups
        </h3>

        {upcomingRuns.length > 0 ? (
          <div className="space-y-3">
            {upcomingRuns.map((job) => (
              <div
                key={job.id}
                className="p-4 rounded-nested bg-[#F6F8F7] border border-[#E3E9E5] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">{job.jobNumber}</span>
                    <Badge variant="neutral">{job.wasteStream}</Badge>
                  </div>
                  <p className="text-[#4B5563]">{job.notes || "Scheduled routine run."}</p>
                </div>

                <div className="sm:text-right">
                  <div className="font-bold text-slate-900">{formatDateTime(job.scheduledAt)}</div>
                  <div className="text-[11px] text-[#00993F] font-semibold">
                    Driver: {job.driverName || "Assigned Crew"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-[#9CA3AF]">
            <CheckCircle2 className="w-6 h-6 text-[#00993F] mx-auto mb-1" />
            <p>Next routine pickup will follow standard {client.collectionFrequency.replace("_", " ")} schedule.</p>
          </div>
        )}
      </div>
    </div>
  );
}
