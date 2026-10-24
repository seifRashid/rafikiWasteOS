import React from "react";
import Link from "next/link";
import { MessageSquare, Clock, Plus, CheckCircle2, AlertTriangle, Truck, Inbox, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getAllCustomerRequestsAdmin } from "@/server/db/customer-support-queries";
import { AdminRequestActions } from "@/components/customers/admin-request-actions";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CustomerRequestsPage() {
  const requests = await getAllCustomerRequestsAdmin();

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E3E9E5]">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Customer Service Requests
          </h1>
          <p className="text-xs text-[#4B5563] mt-0.5">
            Incoming on-demand collection bookings, container additions, and special bulk clearances submitted by clients.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {pendingCount > 0 && (
            <Badge variant="amber" dot>
              {pendingCount} Pending Dispatch
            </Badge>
          )}
          <span className="text-xs text-[#4B5563] font-medium">
            Total Requests: <strong>{requests.length}</strong>
          </span>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white rounded-card p-12 border border-[#E3E9E5] text-center space-y-3 shadow-card-elevated">
          <div className="w-12 h-12 rounded-full bg-[#EEFBFD] text-[#08A6BA] flex items-center justify-center mx-auto text-xl">
            <Inbox className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">No Service Requests Logged</h3>
          <p className="text-xs text-[#4B5563] max-w-sm mx-auto">
            When clients submit extra collection bookings or bin requests via their Client Portal, they will appear here for dispatch.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {requests.map((req) => (
            <div
              key={req.id}
              className="p-5 rounded-card bg-white border border-[#E3E9E5] shadow-card-hoverable flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
            >
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold text-[#08A6BA] bg-[#EEFBFD] px-2.5 py-0.5 rounded-full border border-[#B6EEF5]">
                    {req.ticketNumber}
                  </span>
                  <span className="font-bold text-slate-900 text-sm">{req.clientName}</span>
                  <span className="font-mono text-[10px] text-[#9CA3AF] bg-[#F6F8F7] px-2 py-0.5 rounded-full">
                    {req.clientAccountNumber}
                  </span>
                  <Badge
                    variant={
                      req.priority === "high" || req.priority === "urgent"
                        ? "amber"
                        : req.priority === "medium"
                        ? "cyan"
                        : "neutral"
                    }
                  >
                    {req.priority} priority
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-[#00682B] bg-[#EDF9F1] px-2 py-0.5 rounded-[8px] border border-[#ADE4C1]">
                    {req.type}
                  </span>
                  <h4 className="font-bold text-slate-800 text-xs">{req.subject}</h4>
                </div>

                <p className="text-xs text-[#4B5563] mt-1 max-w-2xl leading-relaxed">{req.details}</p>

                <div className="text-[11px] text-[#9CA3AF] mt-2 flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Requested: {formatDate(req.createdAt)}</span>
                  </div>
                  {req.preferredDate && (
                    <div className="flex items-center gap-1 text-[#08A6BA] font-semibold">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Preferred Date: {req.preferredDate}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Badge
                  variant={
                    req.status === "completed"
                      ? "primary"
                      : req.status === "assigned" || req.status === "in_progress"
                      ? "cyan"
                      : req.status === "rejected"
                      ? "danger"
                      : "amber"
                  }
                  dot
                >
                  {req.status.replace("_", " ")}
                </Badge>

                <AdminRequestActions requestId={req.id} currentStatus={req.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
