"use client";

import React, { useState } from "react";
import {
  MessageSquare,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  X,
  Truck,
  Sparkles,
  Inbox,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { submitCustomerRequestAction } from "@/server/actions/customer-support";
import type { ClientRequestItem } from "@/server/db/customer-support-queries";
import type { Client } from "@/server/db/schema";

interface ClientRequestsViewProps {
  initialRequests: ClientRequestItem[];
  client: Client;
}

export function ClientRequestsView({ initialRequests, client }: ClientRequestsViewProps) {
  const [requests, setRequests] = useState<ClientRequestItem[]>(initialRequests);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    type: "Extra Bulk Organic Collection" as const,
    subject: "",
    details: "",
    priority: "normal" as const,
    preferredDate: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setLoading(true);

    try {
      const res = await submitCustomerRequestAction(formData);

      if (res.success && res.data) {
        setSuccessMsg(`Service request submitted successfully! (Ticket: ${res.data.ticketNumber})`);

        const newReq: ClientRequestItem = {
          id: res.data.id,
          ticketNumber: res.data.ticketNumber,
          type: formData.type,
          subject: formData.subject,
          details: formData.details,
          priority: formData.priority,
          status: "pending",
          preferredDate: formData.preferredDate || null,
          adminNotes: null,
          createdAt: new Date(),
        };

        setRequests([newReq, ...requests]);

        setTimeout(() => {
          setSuccessMsg(null);
          setIsModalOpen(false);
          setFormData({
            type: "Extra Bulk Organic Collection",
            subject: "",
            details: "",
            priority: "normal",
            preferredDate: "",
          });
        }, 1500);
      } else {
        setFormError(res.error || "Failed to submit request.");
      }
    } catch {
      setFormError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E3E9E5]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs font-bold text-[#00993F] bg-[#EDF9F1] px-2.5 py-0.5 rounded-full border border-[#ADE4C1]">
              {client.accountNumber}
            </span>
            <span className="text-xs font-medium text-[#4B5563]">{client.name}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Service Requests
          </h1>
          <p className="text-xs text-[#4B5563] mt-0.5">
            Submit on-demand collection bookings, container replacements, or special bulk pickups.
          </p>
        </div>

        <button
          onClick={() => {
            setFormError(null);
            setSuccessMsg(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-nested bg-[#00993F] hover:bg-[#008235] text-white text-xs font-bold shadow-sm transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Service Request</span>
        </button>
      </div>

      {/* Requests List */}
      {requests.length === 0 ? (
        <div className="bg-white rounded-card p-12 border border-[#E3E9E5] text-center space-y-3 shadow-card-elevated">
          <div className="w-12 h-12 rounded-full bg-[#EDF9F1] text-[#00993F] flex items-center justify-center mx-auto text-xl">
            <Inbox className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">No Active Service Requests</h3>
          <p className="text-xs text-[#4B5563] max-w-sm mx-auto">
            You currently have no pending service requests. Need extra bin capacity or an unscheduled run?
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#00993F] text-white rounded-nested font-bold text-xs hover:bg-[#008235] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Request</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {requests.map((req) => (
            <div
              key={req.id}
              className="p-5 rounded-card bg-white border border-[#E3E9E5] shadow-card-hoverable flex flex-col sm:flex-row sm:items-start justify-between gap-4 transition-all"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#08A6BA] bg-[#EEFBFD] px-2.5 py-0.5 rounded-full border border-[#B6EEF5]">
                    {req.ticketNumber}
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
                  <span className="text-[11px] font-bold text-slate-700 bg-[#F6F8F7] px-2 py-0.5 rounded-[8px] border border-[#E3E9E5]">
                    {req.type}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm">{req.subject}</h3>
                <p className="text-xs text-[#4B5563] leading-relaxed max-w-2xl">{req.details}</p>

                <div className="flex flex-wrap items-center gap-4 text-[11px] text-[#9CA3AF] pt-1">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Submitted: {formatDate(req.createdAt)}</span>
                  </div>
                  {req.preferredDate && (
                    <div className="flex items-center gap-1 text-[#00682B] font-medium">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Target Date: {req.preferredDate}</span>
                    </div>
                  )}
                </div>

                {req.adminNotes && (
                  <div className="mt-2 p-2.5 rounded-nested bg-[#EDF9F1] border border-[#ADE4C1] text-xs text-[#00682B]">
                    <strong>Operations Note:</strong> {req.adminNotes}
                  </div>
                )}
              </div>

              <div className="shrink-0 flex items-center gap-2 sm:self-center">
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
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Submission Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-card max-w-lg w-full p-6 shadow-modal border border-[#E3E9E5] animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F4F2]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#EDF9F1] text-[#00993F] flex items-center justify-center">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">New Service Request</h3>
                  <p className="text-[11px] text-[#4B5563]">Log an on-demand operational request</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {successMsg ? (
              <div className="py-8 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-[#EDF9F1] text-[#00993F] flex items-center justify-center mx-auto mb-2">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-[#00682B]">{successMsg}</p>
                <p className="text-xs text-[#4B5563]">
                  Your request has been routed to the logistics dispatch desk.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
                {formError && (
                  <div className="p-2.5 rounded-[10px] bg-red-50 border border-red-200 text-red-700 flex items-center gap-2 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                    <span>{formError}</span>
                  </div>
                )}

                <div>
                  <label className="font-bold text-[#4B5563] block mb-1">
                    Request Category / Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full p-2.5 rounded-nested border border-[#E3E9E5] bg-white text-xs focus:outline-none focus:border-[#00993F]"
                  >
                    <option value="Extra Bulk Organic Collection">Extra Bulk Organic Collection</option>
                    <option value="Extra Recyclable Collection">Extra Recyclable Collection</option>
                    <option value="Additional Bins Request">Additional Bins Request</option>
                    <option value="Bin Replacement / Repair">Bin Replacement / Repair</option>
                    <option value="Hazardous or Electronic Clearance">Hazardous or Electronic Clearance</option>
                    <option value="Schedule Change Request">Schedule Change Request</option>
                    <option value="Special Event Support">Special Event Support</option>
                    <option value="Other Service Request">Other Service Request</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#4B5563] block mb-1">
                    Request Subject *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Urgent afternoon compactor run for wedding banquet"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full p-2.5 rounded-nested border border-[#E3E9E5] text-xs focus:outline-none focus:border-[#00993F]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-[#4B5563] block mb-1">
                      Urgency / Priority *
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                      className="w-full p-2.5 rounded-nested border border-[#E3E9E5] bg-white text-xs focus:outline-none focus:border-[#00993F]"
                    >
                      <option value="low">Low (Standard)</option>
                      <option value="normal">Normal (Routine)</option>
                      <option value="medium">Medium</option>
                      <option value="high">High Priority</option>
                      <option value="urgent">Urgent / Emergency</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-[#4B5563] block mb-1">
                      Preferred Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={formData.preferredDate}
                      onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                      className="w-full p-2 rounded-nested border border-[#E3E9E5] bg-white text-xs focus:outline-none focus:border-[#00993F]"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-[#4B5563] block mb-1">
                    Detailed Description *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe specific access instructions, waste estimated volume, bin location, or event timing..."
                    value={formData.details}
                    onChange={(e) => setFormData({ ...formData, details: e.target.value })}
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
                    className="px-5 py-2 text-xs font-bold bg-[#00993F] text-white rounded-nested hover:bg-[#008235] transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                  >
                    {loading ? (
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Plus className="w-3.5 h-3.5" />
                    )}
                    <span>{loading ? "Submitting..." : "Submit Request"}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
