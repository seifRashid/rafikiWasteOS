"use client";

import React, { useState, useMemo } from "react";
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
  RefreshCw,
  FileText,
  Printer,
  Phone,
  User,
  ShieldAlert,
  Send,
  Eye,
  Building,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { formatWeight, formatDateTime, formatDate } from "@/lib/utils";
import {
  recordCollectionWeightAction,
  updateJobStatusAction,
  reportMissedJobAction,
  createJobAction,
  refreshJobsAction,
} from "@/server/actions/collections";
import type { CollectionJob, Client, Route, Vehicle } from "@/server/db/schema";

export interface JobWithDetails {
  job: CollectionJob;
  client: Client | null;
  route: Route | null;
  vehicle: Vehicle | null;
}

interface CollectionsViewProps {
  initialJobs: JobWithDetails[];
  clients?: Client[];
  vehicles?: Vehicle[];
}

export function CollectionsView({ initialJobs, clients = [], vehicles = [] }: CollectionsViewProps) {
  const [jobs, setJobs] = useState<JobWithDetails[]>(initialJobs);
  const [selectedDate, setSelectedDate] = useState<string>("2026-10-14");
  const [showAllDates, setShowAllDates] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const [activeStatus, setActiveStatus] = useState<string>("all");
  const [streamFilter, setStreamFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Notification Toast State
  const [notification, setNotification] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Weighbridge Scale Modal State
  const [selectedJobForWeight, setSelectedJobForWeight] = useState<CollectionJob | null>(null);
  const [grossWeight, setGrossWeight] = useState("");
  const [tareWeight, setTareWeight] = useState("10550");
  const [weightLoading, setWeightLoading] = useState(false);

  // Missed Stop Modal State
  const [selectedJobForMissed, setSelectedJobForMissed] = useState<CollectionJob | null>(null);
  const [missedReason, setMissedReason] = useState<
    "gate_locked" | "access_blocked" | "bin_empty" | "client_not_ready" | "severe_weather"
  >("gate_locked");
  const [missedNotes, setMissedNotes] = useState("");

  // Digital Job Sheet Modal State
  const [selectedJobForDetail, setSelectedJobForDetail] = useState<JobWithDetails | null>(null);

  // Create On-Demand Job Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [newJobClientId, setNewJobClientId] = useState(clients[0]?.id || "");
  const [newJobStream, setNewJobStream] = useState<
    "organic" | "recyclable" | "residual" | "hazardous" | "electronic"
  >("organic");
  const [newJobExpectedKg, setNewJobExpectedKg] = useState("350");
  const [newJobDate, setNewJobDate] = useState("2026-10-14");
  const [newJobTime, setNewJobTime] = useState("10:00");
  const [newJobVehicleId, setNewJobVehicleId] = useState(vehicles[0]?.id || "");
  const [newJobDriverName, setNewJobDriverName] = useState(
    vehicles[0]?.assignedDriverName || "Mohammed Bakari"
  );
  const [newJobNotes, setNewJobNotes] = useState("");

  // Filter Jobs based on Date, Status, Stream, and Search
  const filteredJobs = useMemo(() => {
    return jobs.filter(({ job, client }) => {
      // Date filter
      if (!showAllDates) {
        const jobDate = new Date(job.scheduledAt).toISOString().split("T")[0];
        if (jobDate !== selectedDate) return false;
      }

      // Status filter
      if (activeStatus !== "all" && job.status !== activeStatus) return false;

      // Stream filter
      if (streamFilter !== "all" && job.wasteStream !== streamFilter) return false;

      // Search term
      if (searchTerm.trim() !== "") {
        const term = searchTerm.toLowerCase();
        const matchesJobNumber = job.jobNumber.toLowerCase().includes(term);
        const matchesClient = client?.name.toLowerCase().includes(term);
        const matchesAddress = client?.physicalAddress.toLowerCase().includes(term);
        const matchesDriver = job.driverName?.toLowerCase().includes(term);
        const matchesNotes = job.notes?.toLowerCase().includes(term);
        if (!matchesJobNumber && !matchesClient && !matchesAddress && !matchesDriver && !matchesNotes) {
          return false;
        }
      }

      return true;
    });
  }, [jobs, selectedDate, showAllDates, activeStatus, streamFilter, searchTerm]);

  // Dynamic Telemetry Metrics
  const metrics = useMemo(() => {
    let totalExpectedKg = 0;
    let totalActualKg = 0;
    let completedCount = 0;
    let inProgressCount = 0;
    let missedCount = 0;

    filteredJobs.forEach(({ job }) => {
      totalExpectedKg += parseFloat(job.expectedQuantityKg || "0");
      if (job.actualWeightKg) {
        totalActualKg += parseFloat(job.actualWeightKg);
      }
      if (job.status === "completed" || job.status === "delivered") {
        completedCount++;
      } else if (job.status === "in_progress" || job.status === "collected") {
        inProgressCount++;
      } else if (job.status === "missed") {
        missedCount++;
      }
    });

    return {
      totalStops: filteredJobs.length,
      totalExpectedKg,
      totalActualKg,
      completedCount,
      inProgressCount,
      missedCount,
    };
  }, [filteredJobs]);

  // Sync Daily Jobs Action
  const handleSyncDailyJobs = async (targetDate?: string) => {
    const syncDate = targetDate || selectedDate;
    setIsSyncing(true);
    try {
      const res = await refreshJobsAction(syncDate);
      if (res.success && res.jobs) {
        setJobs(res.jobs);
        showToast(`Refreshed jobs from database for ${syncDate}. Found ${res.jobs.length} total records.`);
      } else {
        showToast(res.error || "Failed to synchronize jobs.", "error");
      }
    } catch {
      showToast("Error connecting to database.", "error");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDateChange = async (newDate: string) => {
    setSelectedDate(newDate);
    await handleSyncDailyJobs(newDate);
  };

  // Status Tab Definitions with Live Badge Counts
  const statuses = [
    { id: "all", label: "All Collections", count: jobs.length },
    {
      id: "scheduled",
      label: "Scheduled",
      count: jobs.filter((j) => j.job.status === "scheduled").length,
    },
    {
      id: "assigned",
      label: "Assigned",
      count: jobs.filter((j) => j.job.status === "assigned").length,
    },
    {
      id: "in_progress",
      label: "In Progress",
      count: jobs.filter((j) => j.job.status === "in_progress").length,
    },
    {
      id: "collected",
      label: "Collected",
      count: jobs.filter((j) => j.job.status === "collected").length,
    },
    {
      id: "delivered",
      label: "Delivered",
      count: jobs.filter((j) => j.job.status === "delivered").length,
    },
    {
      id: "completed",
      label: "Completed",
      count: jobs.filter((j) => j.job.status === "completed").length,
    },
    {
      id: "missed",
      label: "Missed",
      count: jobs.filter((j) => j.job.status === "missed").length,
    },
  ];

  // Record Weighbridge Net Intake
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
        notes: "Depot weighbridge certified net intake",
      });

      if (res.success && res.netWeightKg) {
        setJobs((prev) =>
          prev.map((item) =>
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
        showToast(
          `Weighbridge verified: Net intake certified at ${formatWeight(res.netWeightKg, "kg")}.`
        );
        setSelectedJobForWeight(null);
        setGrossWeight("");
      } else {
        showToast(res.error || "Weight certification failed", "error");
      }
    } catch {
      showToast("Error recording weighbridge scale reading.", "error");
    } finally {
      setWeightLoading(false);
    }
  };

  // Report Missed Collection Stop
  const handleReportMissed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJobForMissed) return;

    try {
      const res = await reportMissedJobAction({
        jobId: selectedJobForMissed.id,
        missedReason,
        notes: missedNotes || "Customer site inaccessible / Gate locked",
      });

      if (res.success) {
        setJobs((prev) =>
          prev.map((item) =>
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
        showToast(`Job ${selectedJobForMissed.jobNumber} marked as missed.`);
        setSelectedJobForMissed(null);
        setMissedNotes("");
      } else {
        showToast(res.error || "Failed to log missed stop", "error");
      }
    } catch {
      showToast("Error updating missed collection.", "error");
    }
  };

  // Advance Job Status
  const handleAdvanceStatus = async (jobId: string, nextStatus: any) => {
    try {
      const res = await updateJobStatusAction({
        jobId,
        status: nextStatus,
      });

      if (res.success) {
        setJobs((prev) =>
          prev.map((item) =>
            item.job.id === jobId ? { ...item, job: { ...item.job, status: nextStatus } } : item
          )
        );
        showToast(`Job status transitioned to ${nextStatus.replace("_", " ")}.`);
        if (selectedJobForDetail && selectedJobForDetail.job.id === jobId) {
          setSelectedJobForDetail((prev) =>
            prev ? { ...prev, job: { ...prev.job, status: nextStatus } } : null
          );
        }
      } else {
        showToast(res.error || "Failed to transition status", "error");
      }
    } catch {
      showToast("Error updating job status.", "error");
    }
  };

  // Create New On-Demand Job
  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJobClientId) return;
    setCreateLoading(true);

    try {
      const scheduledDateTime = `${newJobDate}T${newJobTime}:00.000Z`;
      const res = await createJobAction({
        clientId: newJobClientId,
        wasteStream: newJobStream,
        expectedQuantityKg: parseFloat(newJobExpectedKg) || 300,
        scheduledAt: scheduledDateTime,
        vehicleId: newJobVehicleId || undefined,
        driverName: newJobDriverName || undefined,
        notes: newJobNotes || undefined,
      });

      if (res.success) {
        showToast("New collection job booked and registered successfully!");
        setIsCreateModalOpen(false);
        setNewJobNotes("");
        await handleSyncDailyJobs(newJobDate);
      } else {
        showToast(res.error || "Failed to create job", "error");
      }
    } catch {
      showToast("Error saving collection job to database.", "error");
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification Alert */}
      {notification && (
        <div
          className={`p-3.5 rounded-card flex items-center justify-between text-xs font-bold border transition-all animate-in fade-in slide-in-from-top-2 ${
            notification.type === "success"
              ? "bg-[#EDF9F1] border-[#ADE4C1] text-[#00682B]"
              : "bg-red-50 border-red-200 text-red-900"
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === "success" ? (
              <Check className="w-4 h-4 text-[#00993F]" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600" />
            )}
            <span>{notification.text}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-slate-700"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header & Main Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#E3E9E5]">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Waste Collection & Job Management</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#EDF9F1] text-[#00993F] border border-[#ADE4C1]">
              Live Neon DB
            </span>
          </h1>
          <p className="text-xs text-[#4B5563] mt-0.5">
            Digital job manifests, GPS field coordinates, weighbridge scales & certified intake tickets.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => handleSyncDailyJobs(selectedDate)}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-nested bg-white border border-[#E3E9E5] hover:bg-[#F6F8F7] text-slate-700 text-xs font-bold transition-all shadow-2xs cursor-pointer disabled:opacity-50"
            title="Refresh jobs and sync schedules from database"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#00993F] ${isSyncing ? "animate-spin" : ""}`} />
            <span>{isSyncing ? "Syncing..." : "Sync Daily Jobs"}</span>
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-nested bg-[#00993F] text-white text-xs font-bold hover:bg-[#008235] transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Collection Job</span>
          </button>

          <Link
            href="/driver"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-nested bg-[#EEFBFD] text-[#056E7C] border border-[#B6EEF5] text-xs font-bold hover:bg-[#D5F6FA] transition-all"
          >
            <Truck className="w-3.5 h-3.5 text-[#08A6BA]" />
            <span>Driver Portal</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Real-time Telemetry Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Collections in View"
          value={metrics.totalStops}
          subtitle={showAllDates ? "All historical dates" : `Manifest for ${formatDate(selectedDate)}`}
          icon={<CheckSquare className="w-5 h-5" />}
          accentColor="primary"
        />

        <StatCard
          title="Tonnage Collected"
          value={
            metrics.totalActualKg > 0
              ? `${(metrics.totalActualKg / 1000).toFixed(2)} t`
              : `${(metrics.totalExpectedKg / 1000).toFixed(2)} t est.`
          }
          subtitle={
            metrics.totalActualKg > 0
              ? `${formatWeight(metrics.totalActualKg, "kg")} certified net`
              : "Estimated volume pending weighbridge"
          }
          icon={<Scale className="w-5 h-5" />}
          accentColor="cyan"
        />

        <StatCard
          title="Intake Certified"
          value={`${metrics.completedCount} / ${metrics.totalStops}`}
          subtitle={`${metrics.inProgressCount} in-transit / active on routes`}
          icon={<CheckCircle2 className="w-5 h-5" />}
          accentColor="primary"
        />

        <StatCard
          title="Missed / Flagged Stops"
          value={metrics.missedCount}
          subtitle={metrics.missedCount === 0 ? "Zero operational exceptions" : "Site access or locked gate"}
          icon={<AlertTriangle className="w-5 h-5" />}
          accentColor={metrics.missedCount > 0 ? "amber" : "neutral"}
        />
      </div>

      {/* Date Filter & Fast Selector Bar */}
      <div className="bg-white rounded-card p-4 border border-[#E3E9E5] shadow-card-elevated space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F0F4F2]">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#00993F]" />
              <span>Manifest Date:</span>
            </span>

            <input
              type="date"
              disabled={showAllDates}
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="px-2.5 py-1 bg-[#F6F8F7] border border-[#E3E9E5] rounded-nested text-xs font-bold text-slate-900 focus:outline-none focus:border-[#00993F] disabled:opacity-50"
            />

            <button
              onClick={() => setShowAllDates(!showAllDates)}
              className={`text-xs font-bold px-3 py-1 rounded-full border transition-all cursor-pointer ${
                showAllDates
                  ? "bg-[#08A6BA] text-white border-[#08A6BA]"
                  : "bg-white text-slate-600 border-[#E3E9E5] hover:bg-[#F0F4F2]"
              }`}
            >
              {showAllDates ? "Showing All Historical Dates" : "Show All Dates"}
            </button>
          </div>

          <div className="text-xs text-slate-500 flex items-center gap-2">
            <span>Filtered Results:</span>
            <strong className="text-slate-900 font-mono text-xs font-bold">
              {filteredJobs.length} collection jobs
            </strong>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {statuses.map((s) => {
            const isSelected = activeStatus === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setActiveStatus(s.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? "bg-[#00993F] text-white shadow-xs font-bold"
                    : "bg-white text-[#4B5563] border border-[#E3E9E5] hover:bg-[#F0F4F2]"
                }`}
              >
                <span>{s.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected ? "bg-white/20 text-white" : "bg-[#F0F4F2] text-slate-600"
                  }`}
                >
                  {s.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Waste Stream Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="relative max-w-md w-full">
            <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by job ID, client name, address, driver, or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-[#E3E9E5] rounded-nested text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#00993F]"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#4B5563] font-bold">Stream:</span>
            <select
              value={streamFilter}
              onChange={(e) => setStreamFilter(e.target.value)}
              className="text-xs p-2 rounded-nested border border-[#E3E9E5] bg-white font-semibold focus:outline-none focus:border-[#00993F]"
            >
              <option value="all">All Streams</option>
              <option value="organic">Organic Waste</option>
              <option value="recyclable">Recyclable (PET/Cardboard)</option>
              <option value="residual">Residual / General Waste</option>
              <option value="hazardous">Hazardous</option>
              <option value="electronic">E-Waste</option>
            </select>
          </div>
        </div>
      </div>

      {/* Jobs Manifest Table */}
      <div className="bg-white rounded-card border border-[#E3E9E5] shadow-card-elevated overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F6F8F7] border-b border-[#E3E9E5]">
              <tr className="text-[#4B5563] font-semibold">
                <th className="py-3 px-4">Job Reference</th>
                <th className="py-3 px-4">Client & Physical Address</th>
                <th className="py-3 px-4">Waste Stream</th>
                <th className="py-3 px-4">Weight (Actual / Est)</th>
                <th className="py-3 px-4">Driver & Assigned Route</th>
                <th className="py-3 px-4">Scheduled For</th>
                <th className="py-3 px-4">Live Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F4F2]">
              {filteredJobs.length > 0 ? (
                filteredJobs.map((item) => {
                  const { job, client, route, vehicle } = item;
                  return (
                    <tr
                      key={job.id}
                      className="hover:bg-[#F6F8F7] transition-colors cursor-pointer group"
                      onClick={() => setSelectedJobForDetail(item)}
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-slate-900 group-hover:text-[#00993F] transition-colors">
                          {job.jobNumber}
                        </div>
                        <div className="text-[11px] text-[#9CA3AF] flex items-center gap-1">
                          <span>Stop #{job.stopSequence || 1}</span>
                          {job.notes?.includes("[On-Demand") && (
                            <span className="text-[9px] px-1 bg-amber-100 text-amber-900 rounded font-bold">
                              On-Demand
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{client?.name || "Client"}</div>
                        <div className="text-[11px] text-[#4B5563] truncate max-w-[200px]">
                          {client?.physicalAddress}
                        </div>
                        {client?.phone && (
                          <div className="text-[10px] text-[#9CA3AF]">{client.phone}</div>
                        )}
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
                          {vehicle?.plateNumber || "Compactor"}{" "}
                          {route?.routeCode ? `• ${route.routeCode}` : ""}
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

                      <td
                        className="py-3.5 px-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedJobForDetail(item)}
                            className="p-1.5 text-slate-500 hover:text-[#00993F] hover:bg-[#EDF9F1] rounded transition-colors"
                            title="View Full Digital Job Sheet"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

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
                              className="px-2.5 py-1 rounded-nested bg-[#EEFBFD] text-[#056E7C] border border-[#B6EEF5] text-[11px] font-bold hover:bg-[#D5F6FA] flex items-center gap-1 cursor-pointer"
                            >
                              <Scale className="w-3 h-3" />
                              <span>Weigh In</span>
                            </button>
                          )}

                          {job.status === "delivered" && (
                            <button
                              onClick={() => handleAdvanceStatus(job.id, "completed")}
                              className="px-2.5 py-1 rounded-nested bg-[#EDF9F1] text-[#00682B] border border-[#ADE4C1] text-[11px] font-bold hover:bg-[#D3F3DE] flex items-center gap-1 cursor-pointer"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Verify</span>
                            </button>
                          )}

                          {job.status === "scheduled" && (
                            <button
                              onClick={() => handleAdvanceStatus(job.id, "in_progress")}
                              className="px-2.5 py-1 rounded-nested bg-[#00993F] text-white text-[11px] font-bold hover:bg-[#008235] cursor-pointer"
                            >
                              Dispatch
                            </button>
                          )}

                          {job.status !== "completed" && job.status !== "missed" && (
                            <button
                              onClick={() => setSelectedJobForMissed(job)}
                              className="p-1.5 text-[#9CA3AF] hover:text-red-600 rounded transition-colors"
                              title="Report Missed Stop"
                            >
                              <AlertTriangle className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center bg-[#F6F8F7]">
                    <p className="text-xs text-slate-600 font-medium">
                      No collection jobs found matching your active filter criteria.
                    </p>
                    <button
                      onClick={() => {
                        setActiveStatus("all");
                        setStreamFilter("all");
                        setSearchTerm("");
                        setShowAllDates(true);
                      }}
                      className="mt-2 text-xs font-bold text-[#00993F] hover:underline"
                    >
                      Clear filters or view all dates
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Digital Job Sheet Detail Modal */}
      {selectedJobForDetail && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-card max-w-2xl w-full p-6 shadow-modal border border-[#E3E9E5] animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#F0F4F2]">
              <div>
                <span className="text-[10px] font-extrabold text-[#00993F] uppercase tracking-wider block">
                  Rafiki WasteOS • Digital Job Sheet
                </span>
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <span>{selectedJobForDetail.job.jobNumber}</span>
                  <Badge
                    variant={
                      selectedJobForDetail.job.status === "completed"
                        ? "primary"
                        : selectedJobForDetail.job.status === "delivered"
                        ? "cyan"
                        : selectedJobForDetail.job.status === "in_progress"
                        ? "amber"
                        : "neutral"
                    }
                    dot
                  >
                    {selectedJobForDetail.job.status.replace("_", " ")}
                  </Badge>
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="p-1.5 rounded-nested border border-[#E3E9E5] text-slate-600 hover:bg-[#F6F8F7] text-xs font-bold flex items-center gap-1"
                  title="Print Job Sheet"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Print</span>
                </button>
                <button
                  onClick={() => setSelectedJobForDetail(null)}
                  className="text-slate-400 hover:text-slate-700 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              {/* Client & Address Info */}
              <div className="p-3.5 rounded-nested bg-[#F6F8F7] border border-[#E3E9E5] grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-[11px] font-bold text-[#9CA3AF] block uppercase">Client Profile</span>
                  <strong className="text-slate-900 block text-sm mt-0.5">
                    {selectedJobForDetail.client?.name || "Client Scheduled Stop"}
                  </strong>
                  <div className="text-[#4B5563] mt-1 flex items-start gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#00993F] shrink-0 mt-0.5" />
                    <span>{selectedJobForDetail.client?.physicalAddress || "Nairobi, Kenya"}</span>
                  </div>
                  <div className="text-[#4B5563] mt-1 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedJobForDetail.client?.phone || "+254 712 345 678"}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-[#9CA3AF] block uppercase">Dispatch Details</span>
                  <div className="text-slate-900 font-semibold mt-0.5">
                    Driver: {selectedJobForDetail.job.driverName || "Assigned Driver"}
                  </div>
                  <div className="text-[#4B5563] mt-1">
                    Vehicle: {selectedJobForDetail.vehicle?.plateNumber || "Compactor Truck"}
                  </div>
                  <div className="text-[#4B5563] mt-1">
                    Route: {selectedJobForDetail.route?.routeCode || "Daily Loop"} (Stop #
                    {selectedJobForDetail.job.stopSequence || 1})
                  </div>
                  <div className="text-[#4B5563] mt-1">
                    Scheduled: {formatDateTime(selectedJobForDetail.job.scheduledAt)}
                  </div>
                </div>
              </div>

              {/* Weight & Intake Telemetry */}
              <div className="p-3.5 rounded-nested border border-[#E3E9E5] bg-white grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <span className="text-[#9CA3AF] block font-semibold">Waste Stream:</span>
                  <strong className="text-slate-900 capitalize font-bold">
                    {selectedJobForDetail.job.wasteStream}
                  </strong>
                </div>

                <div>
                  <span className="text-[#9CA3AF] block font-semibold">Estimated Weight:</span>
                  <strong className="font-mono text-slate-900">
                    {formatWeight(selectedJobForDetail.job.expectedQuantityKg, "kg")}
                  </strong>
                </div>

                <div>
                  <span className="text-[#9CA3AF] block font-semibold">Certified Net Intake:</span>
                  <strong className="font-mono text-[#00993F] text-sm">
                    {selectedJobForDetail.job.actualWeightKg
                      ? formatWeight(selectedJobForDetail.job.actualWeightKg, "kg")
                      : "Pending Scale"}
                  </strong>
                </div>
              </div>

              {/* Scale Ticket Weights (if recorded) */}
              {selectedJobForDetail.job.grossWeightKg && (
                <div className="p-3 rounded-nested bg-[#EDF9F1] border border-[#ADE4C1] flex items-center justify-between font-mono text-xs text-[#00682B]">
                  <span>Scale Gross: {selectedJobForDetail.job.grossWeightKg} kg</span>
                  <span>Tare: {selectedJobForDetail.job.tareWeightKg} kg</span>
                  <span className="font-bold">
                    Net: {selectedJobForDetail.job.actualWeightKg} kg
                  </span>
                </div>
              )}

              {/* Notes */}
              <div>
                <span className="text-[11px] font-bold text-[#9CA3AF] uppercase block mb-1">
                  Operational Notes & Field Logs
                </span>
                <div className="p-2.5 rounded-nested bg-[#F6F8F7] border border-[#E3E9E5] text-[#4B5563]">
                  {selectedJobForDetail.job.notes || "No special instructions provided."}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-3 flex flex-wrap items-center justify-end gap-2 border-t border-[#F0F4F2]">
                {selectedJobForDetail.job.status === "scheduled" && (
                  <button
                    onClick={() => handleAdvanceStatus(selectedJobForDetail.job.id, "in_progress")}
                    className="px-3.5 py-1.5 rounded-nested bg-[#00993F] text-white font-bold text-xs hover:bg-[#008235] cursor-pointer"
                  >
                    Dispatch Stop
                  </button>
                )}

                {selectedJobForDetail.job.status === "collected" && (
                  <button
                    onClick={() => {
                      const job = selectedJobForDetail.job;
                      setSelectedJobForDetail(null);
                      setSelectedJobForWeight(job);
                      setGrossWeight(
                        (
                          parseFloat(tareWeight) + parseFloat(job.expectedQuantityKg || "500")
                        ).toString()
                      );
                    }}
                    className="px-3.5 py-1.5 rounded-nested bg-[#08A6BA] text-white font-bold text-xs hover:bg-[#067382] cursor-pointer"
                  >
                    Weighbridge Net Intake
                  </button>
                )}

                {selectedJobForDetail.job.status === "delivered" && (
                  <button
                    onClick={() => handleAdvanceStatus(selectedJobForDetail.job.id, "completed")}
                    className="px-3.5 py-1.5 rounded-nested bg-[#00993F] text-white font-bold text-xs hover:bg-[#008235] cursor-pointer"
                  >
                    Verify & Complete
                  </button>
                )}

                <button
                  onClick={() => setSelectedJobForDetail(null)}
                  className="px-3.5 py-1.5 rounded-nested border border-[#E3E9E5] text-slate-700 hover:bg-[#F0F4F2] text-xs font-bold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create New Collection Job Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-card max-w-lg w-full p-6 shadow-modal border border-[#E3E9E5] animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F4F2]">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#00993F]" />
                <span>Book On-Demand Collection Job</span>
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-[#4B5563] block mb-1">Select Client Account *</label>
                <select
                  required
                  value={newJobClientId}
                  onChange={(e) => setNewJobClientId(e.target.value)}
                  className="w-full p-2.5 rounded-nested border border-[#E3E9E5] bg-white text-slate-900 font-semibold focus:outline-none focus:border-[#00993F]"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.accountNumber}) — {c.customerType}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#4B5563] block mb-1">Waste Stream *</label>
                  <select
                    value={newJobStream}
                    onChange={(e) => setNewJobStream(e.target.value as any)}
                    className="w-full p-2.5 rounded-nested border border-[#E3E9E5] bg-white font-semibold focus:outline-none focus:border-[#00993F]"
                  >
                    <option value="organic">Organic Waste</option>
                    <option value="recyclable">Recyclable (Plastics/Paper)</option>
                    <option value="residual">Residual General Waste</option>
                    <option value="hazardous">Hazardous Waste</option>
                    <option value="electronic">E-Waste</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#4B5563] block mb-1">Estimated Quantity (kg) *</label>
                  <input
                    type="number"
                    required
                    min="10"
                    step="10"
                    value={newJobExpectedKg}
                    onChange={(e) => setNewJobExpectedKg(e.target.value)}
                    className="w-full p-2.5 rounded-nested border border-[#E3E9E5] font-mono font-bold focus:outline-none focus:border-[#00993F]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#4B5563] block mb-1">Scheduled Date *</label>
                  <input
                    type="date"
                    required
                    value={newJobDate}
                    onChange={(e) => setNewJobDate(e.target.value)}
                    className="w-full p-2.5 rounded-nested border border-[#E3E9E5] font-bold focus:outline-none focus:border-[#00993F]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#4B5563] block mb-1">Time Window *</label>
                  <input
                    type="time"
                    required
                    value={newJobTime}
                    onChange={(e) => setNewJobTime(e.target.value)}
                    className="w-full p-2.5 rounded-nested border border-[#E3E9E5] font-mono focus:outline-none focus:border-[#00993F]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#4B5563] block mb-1">Assign Truck (Optional)</label>
                  <select
                    value={newJobVehicleId}
                    onChange={(e) => setNewJobVehicleId(e.target.value)}
                    className="w-full p-2.5 rounded-nested border border-[#E3E9E5] bg-white font-semibold focus:outline-none focus:border-[#00993F]"
                  >
                    <option value="">Unassigned</option>
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.plateNumber} ({v.model})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#4B5563] block mb-1">Driver Name (Optional)</label>
                  <input
                    type="text"
                    value={newJobDriverName}
                    onChange={(e) => setNewJobDriverName(e.target.value)}
                    className="w-full p-2.5 rounded-nested border border-[#E3E9E5] font-semibold focus:outline-none focus:border-[#00993F]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#4B5563] block mb-1">Special Site Instructions</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Call client 15 minutes prior to arrival; pickup bins from basement bay..."
                  value={newJobNotes}
                  onChange={(e) => setNewJobNotes(e.target.value)}
                  className="w-full p-2.5 rounded-nested border border-[#E3E9E5] focus:outline-none focus:border-[#00993F]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#F0F4F2]">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#4B5563] hover:bg-[#F0F4F2] rounded-nested cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="px-4 py-2 text-xs font-bold bg-[#00993F] text-white rounded-nested hover:bg-[#008235] transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {createLoading ? "Creating..." : "Confirm & Dispatch Job"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                  className="px-4 py-2 text-xs font-semibold text-[#4B5563] hover:bg-[#F0F4F2] rounded-nested cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={weightLoading}
                  className="px-4 py-2 text-xs font-bold bg-[#00993F] text-white rounded-nested hover:bg-[#008235] transition-colors disabled:opacity-50 cursor-pointer"
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
                  className="px-4 py-2 text-xs font-semibold text-[#4B5563] hover:bg-[#F0F4F2] rounded-nested cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-red-600 text-white rounded-nested hover:bg-red-700 transition-colors cursor-pointer"
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
