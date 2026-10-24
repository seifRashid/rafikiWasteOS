"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  ShieldAlert,
  Inbox,
  UserCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { submitCustomerComplaintAction } from "@/server/actions/customer-support";
import type { ClientComplaintItem } from "@/server/db/customer-support-queries";
import type { Client } from "@/server/db/schema";

interface ClientComplaintsViewProps {
  initialComplaints: ClientComplaintItem[];
  client: Client;
}

export function ClientComplaintsView({ initialComplaints, client }: ClientComplaintsViewProps) {
  const [complaints, setComplaints] = useState<ClientComplaintItem[]>(initialComplaints);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    category: "Missed Collection" as const,
    subject: "",
    description: "",
    priority: "medium" as const,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setLoading(true);

    try {
      const res = await submitCustomerComplaintAction(formData);

      if (res.success && res.data) {
        setSuccessMsg(`Incident reported successfully! (Case: ${res.data.ticketNumber})`);

        const newComplaint: ClientComplaintItem = {
          id: res.data.id,
          ticketNumber: res.data.ticketNumber,
          category: formData.category,
          subject: formData.subject,
          description: formData.description,
          priority: formData.priority,
          status: "open",
          assignedTo: null,
          resolutionNotes: null,
          createdAt: new Date(),
        };

        setComplaints([newComplaint, ...complaints]);

        setTimeout(() => {
          setSuccessMsg(null);
          setIsModalOpen(false);
          setFormData({
            category: "Missed Collection",
            subject: "",
            description: "",
            priority: "medium",
          });
        }, 1500);
      } else {
        setFormError(res.error || "Failed to log complaint.");
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
            Service Issues &amp; Complaints
          </h1>
          <p className="text-xs text-[#4B5563] mt-0.5">
            Report missed pickups, damaged bins, spill incidents, or billing disputes directly to operations management.
          </p>
        </div>

        <button
          onClick={() => {
            setFormError(null);
            setSuccessMsg(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-nested bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer shrink-0"
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Report an Issue</span>
        </button>
      </div>

      {/* Complaints List */}
      {complaints.length === 0 ? (
        <div className="bg-white rounded-card p-12 border border-[#E3E9E5] text-center space-y-3 shadow-card-elevated">
          <div className="w-12 h-12 rounded-full bg-[#EDF9F1] text-[#00993F] flex items-center justify-center mx-auto text-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">No Reported Service Issues</h3>
          <p className="text-xs text-[#4B5563] max-w-sm mx-auto">
            Your collection services are operating normally without open incident reports. If you experience an issue, log it here.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-nested font-bold text-xs hover:bg-red-700 cursor-pointer"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Report Issue</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {complaints.map((c) => (
            <div
              key={c.id}
              className="p-5 rounded-card bg-white border border-[#E3E9E5] shadow-card-hoverable transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#F0F4F2]">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">
                    {c.ticketNumber}
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
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-sm">{c.subject}</h3>
                <p className="text-xs text-[#4B5563] leading-relaxed mt-1">{c.description}</p>
              </div>

              {c.resolutionNotes && (
                <div className="p-3 rounded-nested bg-[#F0FDF4] border border-[#ADE4C1] text-xs text-[#00682B]">
                  <strong>Resolution Findings:</strong> {c.resolutionNotes}
                </div>
              )}

              <div className="pt-2 border-t border-[#F0F4F2] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-[#9CA3AF]">
                <div className="flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    Assigned Lead:{" "}
                    <strong className="text-slate-700">{c.assignedTo || "Operations Desk Dispatcher"}</strong>
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

      {/* Complaint Report Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-card max-w-lg w-full p-6 shadow-modal border border-[#E3E9E5] animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F4F2]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Report a Service Issue</h3>
                  <p className="text-[11px] text-[#4B5563]">Log an operational incident for review</p>
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
                  A field supervisor has been notified to investigate and resolve this matter.
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
                    Issue Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full p-2.5 rounded-nested border border-[#E3E9E5] bg-white text-xs focus:outline-none focus:border-[#00993F]"
                  >
                    <option value="Missed Collection">Missed Collection / No Show</option>
                    <option value="Damaged Container / Caster">Damaged Container / Broken Caster</option>
                    <option value="Spill / Littering at Site">Spill or Litter Left Around Waste Bay</option>
                    <option value="Late Arrival / Timing Window">Arrival Outside Designated Loading Window</option>
                    <option value="Driver / Crew Conduct">Crew or Driver Conduct / Noise</option>
                    <option value="Billing / Invoice Discrepancy">Billing or Invoice Discrepancy</option>
                    <option value="Weighbridge Discrepancy">Weighbridge Scale or Net Weight Discrepancy</option>
                    <option value="Other Service Failure">Other Service Issue</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#4B5563] block mb-1">
                    Incident Summary / Subject *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Right caster wheel broken during morning compactor tipping"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full p-2.5 rounded-nested border border-[#E3E9E5] text-xs focus:outline-none focus:border-[#00993F]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#4B5563] block mb-1">
                    Severity / Priority Level *
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full p-2.5 rounded-nested border border-[#E3E9E5] bg-white text-xs focus:outline-none focus:border-[#00993F]"
                  >
                    <option value="low">Low (Cosmetic / Non-blocking)</option>
                    <option value="medium">Medium (Standard Attention Needed)</option>
                    <option value="high">High (Urgent — Impeding Daily Operations)</option>
                    <option value="urgent">Urgent / Critical Safety Hazard</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#4B5563] block mb-1">
                    Incident Details &amp; Location *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Provide specific details: time of occurrence, truck registration if noted, location of damaged container, or impact..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                    className="px-5 py-2 text-xs font-bold bg-red-600 text-white rounded-nested hover:bg-red-700 transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                  >
                    {loading ? (
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5" />
                    )}
                    <span>{loading ? "Submitting..." : "Report Incident"}</span>
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
