import React from "react";
import { AlertCircle, CheckCircle2, Clock, MessageSquare, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default function CustomerComplaintsPage() {
  const complaints = [
    {
      id: "CMP-2026-081",
      client: "Kilimani Palms Heights",
      subject: "Bin Wheel Damaged During Tipping",
      description: "During Tuesday morning compactor lift, right caster wheel snapped. Bin cannot roll to curbside.",
      loggedAt: "20 Sep 2026, 09:15",
      status: "in_progress",
      assignedTo: "Julien Ochieng (Depot Maintenance)",
    },
    {
      id: "CMP-2026-079",
      client: "Java House — Kimathi Street",
      subject: "Driver Arrived 45 Mins After CBD Loading Window",
      description: "City Council parking marshal threatened clamping because compactor arrived at 11:45 instead of 11:00 AM.",
      loggedAt: "19 Sep 2026, 12:00",
      status: "resolved",
      assignedTo: "Mohammed Bakari (Lead Driver)",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E3E9E5]">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Customer Complaints & Issue Tracking
          </h1>
          <p className="text-xs text-[#4B5563] mt-0.5">
            Log, investigate and resolve missed stops, broken containers, and service discrepancies.
          </p>
        </div>

        <Badge variant="amber" dot>
          1 Open Complaint Under Investigation
        </Badge>
      </div>

      <div className="space-y-4">
        {complaints.map((c) => (
          <div
            key={c.id}
            className="p-5 rounded-card bg-white border border-[#E3E9E5] shadow-card-hoverable"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#F0F4F2]">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                  {c.id}
                </span>
                <span className="font-bold text-slate-900 text-sm">{c.client}</span>
              </div>

              <Badge variant={c.status === "resolved" ? "primary" : "amber"} dot>
                {c.status.replace("_", " ")}
              </Badge>
            </div>

            <div className="mt-3">
              <h4 className="font-bold text-slate-900 text-xs">{c.subject}</h4>
              <p className="text-xs text-[#4B5563] mt-1">{c.description}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-[#F0F4F2] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#9CA3AF]">
              <span>Assigned Handler: <strong className="text-slate-700">{c.assignedTo}</strong></span>
              <span>Logged: {c.loggedAt}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
