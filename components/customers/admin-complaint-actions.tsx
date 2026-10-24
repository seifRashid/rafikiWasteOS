"use client";

import React, { useState } from "react";
import { CheckCircle2, UserCheck, X } from "lucide-react";
import { updateCustomerComplaintStatusAction } from "@/server/actions/customer-support";

interface AdminComplaintActionsProps {
  complaintId: string;
  currentStatus: string;
  assignedTo?: string | null;
}

export function AdminComplaintActions({
  complaintId,
  currentStatus,
  assignedTo,
}: AdminComplaintActionsProps) {
  const [status, setStatus] = useState(currentStatus);
  const [handler, setHandler] = useState(assignedTo || "");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await updateCustomerComplaintStatusAction(
        complaintId,
        "resolved",
        handler || "Operations Lead",
        resolutionNotes
      );
      if (res.success) {
        setStatus("resolved");
        setIsModalOpen(false);
      } else {
        alert(res.error || "Failed to resolve complaint");
      }
    } catch {
      alert("Error resolving complaint");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignToMe = async () => {
    setLoading(true);
    try {
      const res = await updateCustomerComplaintStatusAction(
        complaintId,
        "in_progress",
        "Operations Dispatch Manager"
      );
      if (res.success) {
        setStatus("in_progress");
        setHandler("Operations Dispatch Manager");
      }
    } catch {
      alert("Error updating assignment");
    } finally {
      setLoading(false);
    }
  };

  if (status === "resolved") {
    return (
      <span className="text-xs font-bold text-[#00682B] flex items-center gap-1">
        <CheckCircle2 className="w-3.5 h-3.5 text-[#00993F]" />
        Resolved
      </span>
    );
  }

  return (
    <>
      <div className="flex items-center gap-2">
        {status === "open" && (
          <button
            onClick={handleAssignToMe}
            disabled={loading}
            className="px-3 py-1.5 bg-[#EDF9F1] hover:bg-[#D3F3DE] text-[#00682B] border border-[#ADE4C1] rounded-nested font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Take Case</span>
          </button>
        )}

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-3 py-1.5 bg-[#00993F] hover:bg-[#008235] text-white rounded-nested font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Resolve Issue</span>
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-card max-w-md w-full p-6 shadow-modal border border-[#E3E9E5] animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F4F2]">
              <h3 className="text-sm font-bold text-slate-900">Resolve Customer Complaint</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleResolve} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-[#4B5563] block mb-1">
                  Assigned Handler / Lead
                </label>
                <input
                  type="text"
                  required
                  value={handler}
                  onChange={(e) => setHandler(e.target.value)}
                  placeholder="e.g. Julien Ochieng (Depot Maintenance)"
                  className="w-full p-2.5 rounded-nested border border-[#E3E9E5] text-xs focus:outline-none focus:border-[#00993F]"
                />
              </div>

              <div>
                <label className="font-bold text-[#4B5563] block mb-1">
                  Resolution Findings &amp; Corrective Action *
                </label>
                <textarea
                  required
                  rows={3}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="e.g. Caster wheel replaced on-site by mobile maintenance van. Bin restored to service."
                  className="w-full p-2.5 rounded-nested border border-[#E3E9E5] text-xs focus:outline-none focus:border-[#00993F]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#F0F4F2]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#4B5563] hover:bg-[#F0F4F2] rounded-nested cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 text-xs font-bold bg-[#00993F] text-white rounded-nested hover:bg-[#008235] transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {loading ? "Saving..." : "Mark as Resolved"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
