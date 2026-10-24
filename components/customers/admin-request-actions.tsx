"use client";

import React, { useState } from "react";
import { Truck, CheckCircle2, XCircle, Clock } from "lucide-react";
import { updateCustomerRequestStatusAction } from "@/server/actions/customer-support";

interface AdminRequestActionsProps {
  requestId: string;
  currentStatus: string;
}

export function AdminRequestActions({ requestId, currentStatus }: AdminRequestActionsProps) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (newStatus: "assigned" | "completed" | "rejected") => {
    setLoading(true);
    try {
      const res = await updateCustomerRequestStatusAction(requestId, newStatus);
      if (res.success) {
        setStatus(newStatus);
      } else {
        alert(res.error || "Failed to update status");
      }
    } catch {
      alert("Error updating request status.");
    } finally {
      setLoading(false);
    }
  };

  if (status === "completed") {
    return (
      <span className="text-[11px] font-bold text-[#00682B] flex items-center gap-1">
        <CheckCircle2 className="w-3.5 h-3.5 text-[#00993F]" />
        Completed
      </span>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      {status === "pending" && (
        <button
          onClick={() => handleUpdate("assigned")}
          disabled={loading}
          className="px-3 py-1.5 bg-[#00993F] hover:bg-[#008235] text-white rounded-nested font-bold text-xs transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
        >
          <Truck className="w-3.5 h-3.5" />
          <span>Dispatch &amp; Assign</span>
        </button>
      )}

      {status === "assigned" && (
        <button
          onClick={() => handleUpdate("completed")}
          disabled={loading}
          className="px-3 py-1.5 bg-[#08A6BA] hover:bg-[#068A9B] text-white rounded-nested font-bold text-xs transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Mark Completed</span>
        </button>
      )}

      {status !== "rejected" && status !== "completed" && (
        <button
          onClick={() => {
            if (confirm("Are you sure you want to dismiss/reject this request?")) {
              handleUpdate("rejected");
            }
          }}
          disabled={loading}
          className="p-1.5 text-slate-400 hover:text-red-600 rounded-nested hover:bg-red-50 text-xs transition-colors cursor-pointer"
          title="Dismiss Request"
        >
          <XCircle className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
