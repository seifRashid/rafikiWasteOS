import React from "react";
import { AlertCircle, CheckCircle2, Clock, MessageSquare, ShieldAlert, Inbox, UserCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getAllCustomerComplaintsAdmin } from "@/server/db/customer-support-queries";
import { AdminComplaintActions } from "@/components/customers/admin-complaint-actions";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CustomerComplaintsPage() {
  const complaints = await getAllCustomerComplaintsAdmin();

  const openCount = complaints.filter((c) => c.status === "open" || c.status === "in_progress").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E3E9E5]">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Customer Complaints &amp; Issue Tracking
          </h1>
          <p className="text-xs text-[#4B5563] mt-0.5">
            Log, investigate and resolve missed stops, broken containers, and service discrepancies reported by clients.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {openCount > 0 ? (
            <Badge variant="amber" dot>
              {openCount} Open {openCount === 1 ? "Incident" : "Incidents"} Under Review
            </Badge>
          ) : (
            <Badge variant="primary" dot>
              All Complaints Resolved
            </Badge>
          )}
          <span className="text-xs text-[#4B5563] font-medium">
            Total Cases: <strong>{complaints.length}</strong>
          </span>
        </div>
      </div>

      {complaints.length === 0 ? (
        <div className="bg-white rounded-card p-12 border border-[#E3E9E5] text-center space-y-3 shadow-card-elevated">
          <div className="w-12 h-12 rounded-full bg-[#EDF9F1] text-[#00993F] flex items-center justify-center mx-auto text-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">No Active Complaints Logged</h3>
          <p className="text-xs text-[#4B5563] max-w-sm mx-auto">
            When clients report missed stops, damaged bins, or billing issues via the Client Portal, they will appear here for investigation.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {complaints.map((c) => (
            <div
              key={c.id}
              className="p-5 rounded-card bg-white border border-[#E3E9E5] shadow-card-hoverable space-y-3 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#F0F4F2]">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">
                    {c.ticketNumber}
                  </span>
                  <span className="font-bold text-slate-900 text-sm">{c.clientName}</span>
                  <span className="font-mono text-[10px] text-[#9CA3AF] bg-[#F6F8F7] px-2 py-0.5 rounded-full">
                    {c.clientAccountNumber}
                  </span>
                  <Badge
                    variant={
                      c.priority === "urgent" || c.priority === "high"
                        ? "amber"
                        : "neutral"
                    }
                  >
                    {c.priority} priority
                  </Badge>
                  <span className="text-[11px] font-bold text-slate-700 bg-[#F6F8F7] px-2 py-0.5 rounded-[8px] border border-[#E3E9E5]">
                    {c.category}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      c.status === "resolved"
                        ? "primary"
                        : c.status === "in_progress"
                        ? "cyan"
                        : c.status === "dismissed"
                        ? "neutral"
                        : "amber"
                    }
                    dot
                  >
                    {c.status.replace("_", " ")}
                  </Badge>
                  <AdminComplaintActions
                    complaintId={c.id}
                    currentStatus={c.status}
                    assignedTo={c.assignedTo}
                  />
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-xs">{c.subject}</h4>
                <p className="text-xs text-[#4B5563] mt-1 leading-relaxed">{c.description}</p>
              </div>

              {c.resolutionNotes && (
                <div className="p-3 rounded-nested bg-[#F0FDF4] border border-[#ADE4C1] text-xs text-[#00682B]">
                  <strong>Resolution Findings &amp; Corrective Action:</strong> {c.resolutionNotes}
                </div>
              )}

              <div className="mt-4 pt-3 border-t border-[#F0F4F2] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#9CA3AF]">
                <div className="flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    Assigned Handler:{" "}
                    <strong className="text-slate-700">{c.assignedTo || "Unassigned (Operations Desk)"}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Logged: {formatDate(c.createdAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
