"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CheckSquare,
  Search,
  Plus,
  Scale,
  Camera,
  MapPin,
  Clock,
  Truck,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  X,
  Check,
  Calendar,
  Layers,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatWeight, formatDateTime } from "@/lib/utils";
import {
  recordCollectionWeightAction,
  updateJobStatusAction,
  reportMissedJobAction,
} from "@/server/actions/collections";
import type { CollectionJob, Client, Route, Vehicle } from "@/server/db/schema";

interface JobWithDetails {
  job: CollectionJob;
  client: Client | null;
  route: Route | null;
  vehicle: Vehicle | null;
}

interface CollectionsViewProps {
  initialJobs: JobWithDetails[];
}

export function CollectionsView({ initialJobs }: CollectionsViewProps) {
  const [jobs, setJobs] = useState<JobWithDetails[]>(initialJobs);
  const [activeStatus, setActiveStatus] = useState<string>("all");
  const [streamFilter, setStreamFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Weighbridge Scale Modal State
  const [selectedJobForWeight, setSelectedJobForWeight] = useState<CollectionJob | null>(null);
  const [grossWeight, setGrossWeight] = useState("");
  const [tareWeight, setTareWeight] = useState("10550"); // Typical truck tare
  const [weightLoading, setWeightLoading] = useState(false);

  // Missed Stop Modal State
  const [selectedJobForMissed, setSelectedJobForMissed] = useState<CollectionJob | null>(null);
  const [missedReason, setMissedReason] = useState<
    "gate_locked" | "access_blocked" | "bin_empty" | "client_not_ready" | "severe_weather"
  >("gate_locked");
  const [missedNotes, setMissedNotes] = useState("");

  const statuses = [
    { id: "all", label: "All Jobs" },
    { id: "scheduled", label: "Scheduled" },
    { id: "in_progress", label: "In Progress" },
    { id: "collected", label: "Collected" },
    { id: "delivered", label: "Delivered" },
    { id: "completed", label: "Completed" },
    { id: "missed", label: "Missed" },
  ];

  const filteredJobs = jobs.filter(({ job, client }) => {
    const matchesSearch =
      job.jobNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.driverName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = activeStatus === "all" || job.status === activeStatus;
    const matchesStream = streamFilter === "all" || job.wasteStream === streamFilter;

    return matchesSearch && matchesStatus && matchesStream;
  });

  const handleRecordWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJobForWeight) return;
    setWeightLoading(true);

    try {
      const gross = parseFloat(grossWeight);
      const tare = parseFloat(tareWeight);
      const res = await recordCollectionWeightAction({
        jobId: selectedJobForWeight.id,
        grossWeightKg: gross,
        tareWeightKg: tare,
        notes: "Depot weighbridge certified intake",
      });

      if (res.success && res.netWeightKg) {
        // Update local state
        setJobs(
          jobs.map((item) =>
            item.job.id === selectedJobForWeight.id
              ? {
                  ...item,
                  job: {
                    ...item.job,
                    status: "delivered",
                    grossWeightKg: gross.toFixed(2),
                    tareWeightKg: tare.toFixed(2),
                    actualWeightKg: res.netWeightKg.toFixed(2),
                  },
                }
              : item
          )
        );
        setSelectedJobForWeight(null);
        setGrossWeight("");
      } else {
        alert(res.error || "Weight recording failed");
      }
    } catch {
      alert("An error occurred while saving weighbridge record");
    } finally {
      setWeightLoading(false);
    }
  };

  const handleReportMissed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJobForMissed) return;

    try {
      const res = await reportMissedJobAction({
        jobId: selectedJobForMissed.id,
        missedReason,
        notes: missedNotes || "Customer site inaccessible",
      });

      if (res.success) {
        setJobs(
          jobs.map((item) =>
            item.job.id === selectedJobForMissed.id
              ? {
                  ...item,
                  job: {
                    ...item.job,
                    status: "missed",
                    missedReason,
                    notes: missedNotes,
                  },
                }
              : item
          )
        );
        setSelectedJobForMissed(null);
        setMissedNotes("");
      }
    } catch {
      alert("Failed to report missed stop");
    }
  };

  const handleAdvanceStatus = async (jobId: string, nextStatus: any) => {
    try {
      const res = await updateJobStatusAction({
        jobId,
        status: nextStatus,
      });

      if (res.success) {
        setJobs(
          jobs.map((item) =>
            item.job.id === jobId ? { ...item, job: { ...item.job, status: nextStatus } } : item
          )
        );
      }
    } catch {
      alert("Failed to advance status");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E3E9E5]">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Waste Collection & Job Management
          </h1>
          <p className="text-xs text-[#4B5563] mt-0.5">
            Digital job manifests, GPS field updates, weighbridge scales & intake certificates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/field"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-nested bg-[#EEFBFD] text-[#056E7C] border border-[#B6EEF5] text-xs font-bold hover:bg-[#D5F6FA] transition-all"
          >
            <span>Switch to Driver Field View</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {statuses.map((s) => {
          const isSelected = activeStatus === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setActiveStatus(s.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                isSelected
                  ? "bg-[#00993F] text-white shadow-sm"
                  : "bg-white text-[#4B5563] border border-[#E3E9E5] hover:bg-[#F0F4F2]"
              }`}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      {/* Search & Waste Stream Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative max-w-md w-full">
          <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by job ID, client name, or driver..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-[#E3E9E5] rounded-full text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#00993F]"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#4B5563] font-medium">Stream:</span>
          <select
            value={streamFilter}
            onChange={(e) => setStreamFilter(e.target.value)}
            className="text-xs p-2 rounded-nested border border-[#E3E9E5] bg-white font-medium focus:outline-none focus:border-[#00993F]"
          >
            <option value="all">All Streams</option>
            <option value="organic">Organic</option>
            <option value="recyclable">Recyclable</option>
            <option value="residual">Residual</option>
          </select>
        </div>
      </div>

      {/* Jobs Manifest Table */}
      <div className="bg-white rounded-card border border-[#E3E9E5] shadow-card-elevated overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F6F8F7] border-b border-[#E3E9E5]">
              <tr className="text-[#4B5563] font-semibold">
                <th className="py-3 px-4">Job / Stop</th>
                <th className="py-3 px-4">Client & Address</th>
                <th className="py-3 px-4">Waste Stream</th>
                <th className="py-3 px-4">Weight (Actual / Est)</th>
                <th className="py-3 px-4">Driver & Vehicle</th>
                <th className="py-3 px-4">Scheduled</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F4F2]">
              {filteredJobs.map(({ job, client, vehicle }) => {
                return (
                  <tr key={job.id} className="hover:bg-[#F6F8F7] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-slate-900">{job.jobNumber}</div>
                      <div className="text-[11px] text-[#9CA3AF]">Stop #{job.stopSequence}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{client?.name || "Client"}</div>
                      <div className="text-[11px] text-[#4B5563] truncate max-w-[200px]">
                        {client?.physicalAddress}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          job.wasteStream === "organic"
                            ? "amber"
                            : job.wasteStream === "recyclable"
                            ? "primary"
                            : "neutral"
                        }
                      >
                        {job.wasteStream}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 font-mono">
                      {job.actualWeightKg ? (
                        <div className="font-bold text-[#00993F]">
                          {formatWeight(job.actualWeightKg, "kg")}
                        </div>
                      ) : (
                        <div className="text-[#4B5563]">
                          ~{formatWeight(job.expectedQuantityKg, "kg")}
                        </div>
                      )}
                      {job.grossWeightKg && (
                        <div className="text-[10px] text-[#9CA3AF]">
                          G: {job.grossWeightKg} | T: {job.tareWeightKg}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">
                        {job.driverName || "Driver Assigned"}
                      </div>
                      <div className="text-[11px] text-[#4B5563]">
                        {vehicle?.plateNumber || "Compactor"}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-[#4B5563]">
                      {formatDateTime(job.scheduledAt)}
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          job.status === "completed"
                            ? "primary"
                            : job.status === "delivered"
                            ? "cyan"
                            : job.status === "collected" || job.status === "in_progress"
                            ? "amber"
                            : job.status === "missed"
                            ? "danger"
                            : "neutral"
                        }
                        dot
                      >
                        {job.status.replace("_", " ")}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {job.status === "collected" && (
                          <button
                            onClick={() => {
                              setSelectedJobForWeight(job);
                              setGrossWeight(
                                (
                                  parseFloat(tareWeight) +
                                  parseFloat(job.expectedQuantityKg || "500")
                                ).toString()
                              );
                            }}
                            className="px-2.5 py-1 rounded-nested bg-[#EEFBFD] text-[#056E7C] border border-[#B6EEF5] text-[11px] font-bold hover:bg-[#D5F6FA] flex items-center gap-1"
                          >
                            <Scale className="w-3 h-3" />
                            <span>Weigh In</span>
                          </button>
                        )}

                        {job.status === "delivered" && (
                          <button
                            onClick={() => handleAdvanceStatus(job.id, "completed")}
                            className="px-2.5 py-1 rounded-nested bg-[#EDF9F1] text-[#00682B] border border-[#ADE4C1] text-[11px] font-bold hover:bg-[#D3F3DE] flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Verify Complete</span>
                          </button>
                        )}

                        {job.status === "scheduled" && (
                          <button
                            onClick={() => handleAdvanceStatus(job.id, "in_progress")}
                            className="px-2.5 py-1 rounded-nested bg-[#00993F] text-white text-[11px] font-bold hover:bg-[#008235]"
                          >
                            Dispatch
                          </button>
                        )}

                        {job.status !== "completed" && job.status !== "missed" && (
                          <button
                            onClick={() => setSelectedJobForMissed(job)}
                            className="p-1 text-[#9CA3AF] hover:text-red-600 rounded"
                            title="Report Missed Stop"
                          >
                            <AlertTriangle className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Weighbridge Intake Modal */}
      {selectedJobForWeight && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-card max-w-md w-full p-6 shadow-modal border border-[#E3E9E5] animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F4F2]">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Scale className="w-4 h-4 text-[#00993F]" />
                Record Weighbridge Net Intake
              </h3>
              <button
                onClick={() => setSelectedJobForWeight(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-3 p-2.5 rounded-nested bg-[#F6F8F7] border border-[#E3E9E5] text-xs">
              <span className="text-[#9CA3AF] block font-medium">Job Reference:</span>
              <span className="font-mono font-bold text-slate-900">
                {selectedJobForWeight.jobNumber}
              </span>
            </div>

            <form onSubmit={handleRecordWeight} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-[#4B5563] block mb-1">
                  Gross Scale Weight (Truck + Waste) [kg] *
                </label>
                <input
                  type="number"
                  step="10"
                  required
                  value={grossWeight}
                  onChange={(e) => setGrossWeight(e.target.value)}
                  className="w-full p-2.5 rounded-nested border border-[#E3E9E5] font-mono text-sm font-bold focus:outline-none focus:border-[#00993F]"
                />
              </div>

              <div>
                <label className="font-bold text-[#4B5563] block mb-1">
                  Tare Weight (Empty Truck) [kg] *
                </label>
                <input
                  type="number"
                  step="10"
                  required
                  value={tareWeight}
                  onChange={(e) => setTareWeight(e.target.value)}
                  className="w-full p-2.5 rounded-nested border border-[#E3E9E5] font-mono text-sm focus:outline-none focus:border-[#00993F]"
                />
              </div>

              {/* Calculated Net Weight preview */}
              {parseFloat(grossWeight) > parseFloat(tareWeight) && (
                <div className="p-3 rounded-nested bg-[#EDF9F1] border border-[#ADE4C1] flex items-center justify-between">
                  <span className="font-bold text-[#00682B]">Calculated Net Weight:</span>
                  <span className="font-mono text-base font-extrabold text-[#00682B]">
                    {formatWeight(parseFloat(grossWeight) - parseFloat(tareWeight), "kg")}
                  </span>
                </div>
              )}

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#F0F4F2]">
                <button
                  type="button"
                  onClick={() => setSelectedJobForWeight(null)}
                  className="px-4 py-2 text-xs font-semibold text-[#4B5563] hover:bg-[#F0F4F2] rounded-nested"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={weightLoading}
                  className="px-4 py-2 text-xs font-semibold bg-[#00993F] text-white rounded-nested hover:bg-[#008235] transition-colors disabled:opacity-50"
                >
                  {weightLoading ? "Certifying..." : "Certify Weight & Intake"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Missed Stop Modal */}
      {selectedJobForMissed && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-card max-w-md w-full p-6 shadow-modal border border-[#E3E9E5] animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F4F2]">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                Report Missed Stop
              </h3>
              <button
                onClick={() => setSelectedJobForMissed(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleReportMissed} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-[#4B5563] block mb-1">
                  Reason for Missed Stop *
                </label>
                <select
                  value={missedReason}
                  onChange={(e) => setMissedReason(e.target.value as any)}
                  className="w-full p-2.5 rounded-nested border border-[#E3E9E5] bg-white focus:outline-none focus:border-[#00993F]"
                >
                  <option value="gate_locked">Compound Gate Locked / No Access</option>
                  <option value="access_blocked">Narrow Alley Blocked / Roadworks</option>
                  <option value="bin_empty">Bins Empty / No Waste Put Out</option>
                  <option value="client_not_ready">Client Requested Later Pickup</option>
                  <option value="severe_weather">Severe Weather / Flooding</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-[#4B5563] block mb-1">
                  Driver Observation Notes
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Security guard was absent. Called property manager twice..."
                  value={missedNotes}
                  onChange={(e) => setMissedNotes(e.target.value)}
                  className="w-full p-2.5 rounded-nested border border-[#E3E9E5] focus:outline-none focus:border-[#00993F]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#F0F4F2]">
                <button
                  type="button"
                  onClick={() => setSelectedJobForMissed(null)}
                  className="px-4 py-2 text-xs font-semibold text-[#4B5563] hover:bg-[#F0F4F2] rounded-nested"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-red-600 text-white rounded-nested hover:bg-red-700 transition-colors"
                >
                  Confirm Missed Stop
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
