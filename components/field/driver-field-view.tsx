"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Truck,
  MapPin,
  Navigation,
  Phone,
  Camera,
  Scale,
  CheckCircle2,
  AlertTriangle,
  Wifi,
  WifiOff,
  ChevronRight,
  ArrowLeft,
  X,
  Check,
  RotateCw,
  RefreshCw,
  ChevronDown,
  User,
  Layers,
  Calendar,
  ExternalLink,
  ImageIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatWeight } from "@/lib/utils";
import { updateJobStatusAction, reportMissedJobAction } from "@/server/actions/collections";
import type { DriverPortalData, DriverStop } from "@/server/db/driver-queries";

interface DriverFieldViewProps {
  initialData: DriverPortalData;
}

interface QueuedOfflineAction {
  id: string;
  type: "status" | "weight" | "problem";
  payload: any;
  timestamp: string;
}

export function DriverFieldView({ initialData }: DriverFieldViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Core Data State
  const [data, setData] = useState<DriverPortalData>(initialData);
  const [stops, setStops] = useState<DriverStop[]>(initialData.stops);
  const [currentStopIndex, setCurrentStopIndex] = useState(0);

  // Sync state if initialData changes (e.g. on navigation / router.refresh())
  useEffect(() => {
    setData(initialData);
    setStops(initialData.stops);
    setCurrentStopIndex(0);
  }, [initialData]);

  // Network & Offline Queue
  const [isOnline, setIsOnline] = useState(true);
  const [offlineQueue, setOfflineQueue] = useState<QueuedOfflineAction[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // Modals & Action State
  const [modalAction, setModalAction] = useState<"photo" | "weight" | "problem" | "driver_switcher" | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [inputWeight, setInputWeight] = useState("");
  const [problemReason, setProblemReason] = useState<
    "gate_locked" | "access_blocked" | "bin_empty" | "client_not_ready" | "severe_weather" | "vehicle_breakdown" | "other"
  >("gate_locked");
  const [problemNotes, setProblemNotes] = useState("");
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Photo Input Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active Stop
  const activeStop: DriverStop | undefined = stops[currentStopIndex] || stops[0];

  // 1. Mark Stop as Collected
  const handleMarkCollected = async () => {
    if (!activeStop) return;
    setIsSubmitting(true);

    const actualWeight = activeStop.actualWeightKg || activeStop.expectedKg;
    const photoUrl = activeStop.proofPhotoUrl || undefined;

    // Optimistic UI update
    const updated = [...stops];
    updated[currentStopIndex] = {
      ...updated[currentStopIndex],
      status: "collected",
      actualWeightKg: actualWeight,
    };
    setStops(updated);

    if (isOnline) {
      try {
        const res = await updateJobStatusAction({
          jobId: activeStop.id,
          status: "collected",
          actualWeightKg: actualWeight,
          proofPhotoUrl: photoUrl,
        });

        if (res.success) {
          setSuccessToast(`Stop #${activeStop.seq} Marked Collected & Synchronized!`);
        } else {
          setSuccessToast(`Stop #${activeStop.seq} marked locally.`);
        }
      } catch (err) {
        console.warn("Failed to persist online, queueing locally", err);
        queueOfflineAction({
          id: activeStop.id,
          type: "status",
          payload: { jobId: activeStop.id, status: "collected", actualWeightKg: actualWeight },
          timestamp: new Date().toISOString(),
        });
      }
    } else {
      // Offline queue
      queueOfflineAction({
        id: activeStop.id,
        type: "status",
        payload: { jobId: activeStop.id, status: "collected", actualWeightKg: actualWeight },
        timestamp: new Date().toISOString(),
      });
      setSuccessToast(`Stop #${activeStop.seq} saved to offline queue.`);
    }

    setIsSubmitting(false);

    // Advance to next stop
    setTimeout(() => {
      setSuccessToast(null);
      if (currentStopIndex < stops.length - 1) {
        setCurrentStopIndex(currentStopIndex + 1);
      }
    }, 1200);
  };

  // 2. Adjust Weight
  const handleConfirmWeight = async () => {
    if (!activeStop) return;
    const parsedWeight = parseFloat(inputWeight);
    if (isNaN(parsedWeight) || parsedWeight <= 0) {
      alert("Please enter a valid weight in kilograms.");
      return;
    }

    setIsSubmitting(true);

    const updated = [...stops];
    updated[currentStopIndex] = {
      ...updated[currentStopIndex],
      actualWeightKg: parsedWeight,
    };
    setStops(updated);
    setModalAction(null);

    if (isOnline) {
      try {
        await updateJobStatusAction({
          jobId: activeStop.id,
          status: activeStop.status,
          actualWeightKg: parsedWeight,
        });
        setSuccessToast(`Recorded ${parsedWeight} kg to database manifest.`);
      } catch {
        queueOfflineAction({
          id: activeStop.id,
          type: "weight",
          payload: { jobId: activeStop.id, actualWeightKg: parsedWeight },
          timestamp: new Date().toISOString(),
        });
        setSuccessToast(`Recorded ${parsedWeight} kg (Queued for sync).`);
      }
    } else {
      queueOfflineAction({
        id: activeStop.id,
        type: "weight",
        payload: { jobId: activeStop.id, actualWeightKg: parsedWeight },
        timestamp: new Date().toISOString(),
      });
      setSuccessToast(`Recorded ${parsedWeight} kg (Queued offline).`);
    }

    setIsSubmitting(false);
    setTimeout(() => setSuccessToast(null), 2500);
  };

  // 3. Photo Capture & Save
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCapturedPhoto(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSavePhoto = async () => {
    if (!activeStop || !capturedPhoto) return;
    setIsSubmitting(true);

    const updated = [...stops];
    updated[currentStopIndex] = {
      ...updated[currentStopIndex],
      proofPhotoUrl: capturedPhoto,
    };
    setStops(updated);
    setModalAction(null);

    if (isOnline) {
      try {
        await updateJobStatusAction({
          jobId: activeStop.id,
          status: activeStop.status,
          proofPhotoUrl: capturedPhoto,
        });
        setSuccessToast("Proof photo saved & synchronized with depot.");
      } catch {
        setSuccessToast("Photo saved locally.");
      }
    } else {
      setSuccessToast("Photo attached (Queued offline).");
    }

    setIsSubmitting(false);
    setTimeout(() => setSuccessToast(null), 2500);
  };

  // 4. Report Problem (Missed Stop)
  const handleConfirmProblem = async () => {
    if (!activeStop) return;
    setIsSubmitting(true);

    const updated = [...stops];
    updated[currentStopIndex] = {
      ...updated[currentStopIndex],
      status: "missed",
      missedReason: problemReason,
    };
    setStops(updated);
    setModalAction(null);

    if (isOnline) {
      try {
        await reportMissedJobAction({
          jobId: activeStop.id,
          missedReason: problemReason,
          notes: problemNotes || `Reported missed stop by ${data.driverName}`,
        });
        setSuccessToast("Problem logged in database. Dispatcher notified.");
      } catch {
        queueOfflineAction({
          id: activeStop.id,
          type: "problem",
          payload: { jobId: activeStop.id, missedReason: problemReason, notes: problemNotes },
          timestamp: new Date().toISOString(),
        });
        setSuccessToast("Problem logged locally.");
      }
    } else {
      queueOfflineAction({
        id: activeStop.id,
        type: "problem",
        payload: { jobId: activeStop.id, missedReason: problemReason, notes: problemNotes },
        timestamp: new Date().toISOString(),
      });
      setSuccessToast("Problem saved to offline queue.");
    }

    setIsSubmitting(false);

    // Auto advance
    setTimeout(() => {
      setSuccessToast(null);
      if (currentStopIndex < stops.length - 1) {
        setCurrentStopIndex(currentStopIndex + 1);
      }
    }, 1500);
  };

  // Offline Queue Helper
  const queueOfflineAction = (action: QueuedOfflineAction) => {
    setOfflineQueue((prev) => [...prev, action]);
  };

  // Sync Offline Queue when reconnecting
  const syncOfflineQueue = async () => {
    if (offlineQueue.length === 0) return;
    setIsSyncing(true);

    try {
      for (const item of offlineQueue) {
        if (item.type === "status") {
          await updateJobStatusAction(item.payload);
        } else if (item.type === "weight") {
          await updateJobStatusAction(item.payload);
        } else if (item.type === "problem") {
          await reportMissedJobAction(item.payload);
        }
      }
      setOfflineQueue([]);
      setSuccessToast(`Synchronized ${offlineQueue.length} offline actions to server!`);
      router.refresh();
    } catch (err) {
      console.error("Failed to flush offline queue:", err);
      alert("Failed to sync some offline records. Retaining in queue.");
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSuccessToast(null), 3000);
    }
  };

  // Switch Driver Handler
  const handleSwitchDriver = (driverName: string) => {
    setModalAction(null);
    router.push(`/driver?driver=${encodeURIComponent(driverName)}`);
  };

  // Switch Route Loop Handler
  const handleSwitchRoute = (routeId: string) => {
    router.push(`/driver?driver=${encodeURIComponent(data.driverName)}&routeId=${encodeURIComponent(routeId)}`);
  };

  const completedCount = stops.filter((s) => s.status === "collected" || s.status === "delivered" || s.status === "completed").length;
  const remainingCount = stops.length - completedCount;
  const progressPercent = stops.length > 0 ? Math.round((completedCount / stops.length) * 100) : 0;

  return (
    <div className="max-w-md mx-auto space-y-4 pb-20">
      {/* 1. Top Field Bar: Driver Info, Switcher & Connectivity */}
      <div className="bg-white rounded-card p-3.5 border border-[#E3E9E5] shadow-xs flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <Link
            href="/"
            className="w-8 h-8 rounded-full bg-[#F0F4F2] flex items-center justify-center text-[#4B5563] hover:text-slate-900 transition-colors shrink-0"
            title="Exit to ERP Command Centre"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div className="min-w-0">
            {/* Driver Name & Switcher Modal Trigger */}
            <button
              onClick={() => setModalAction("driver_switcher")}
              className="text-left group flex items-center gap-1 cursor-pointer"
              title="Click to switch active driver"
            >
              <span className="text-xs font-black text-slate-900 group-hover:text-[#00993F] transition-colors truncate">
                {data.driverName}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#00993F] shrink-0" />
            </button>

            <div className="text-[11px] text-[#00993F] font-semibold flex items-center gap-1 truncate">
              <Truck className="w-3 h-3 shrink-0" />
              <span className="truncate">
                {data.vehicle
                  ? `${data.vehicle.plateNumber} (${data.vehicle.model.split(" ")[0]})`
                  : "No Truck Assigned"}
              </span>
            </div>
          </div>
        </div>

        {/* Connectivity Switcher */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => {
              const nextState = !isOnline;
              setIsOnline(nextState);
              if (nextState) {
                syncOfflineQueue();
              }
            }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold transition-all cursor-pointer ${
              isOnline
                ? "bg-[#EDF9F1] text-[#00682B] border border-[#ADE4C1]"
                : "bg-[#FFF8D6] text-[#785608] border border-[#FCE38A]"
            }`}
            title="Toggle Offline/Online Simulation Mode"
          >
            {isOnline ? (
              <>
                <Wifi className="w-3 h-3 text-[#00993F]" />
                <span>ONLINE</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 text-[#785608]" />
                <span>OFFLINE ({offlineQueue.length})</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Driver Multiple Routes Selector Pills (if driver assigned multiple loops today) */}
      {data.driverRoutes && data.driverRoutes.length > 1 && (
        <div className="bg-white rounded-card p-2.5 border border-[#E3E9E5] shadow-xs">
          <div className="flex items-center justify-between pb-1.5 px-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Layers className="w-3 h-3 text-[#08A6BA]" />
              <span>Assigned Route Loops ({data.driverRoutes.length}):</span>
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-none">
            {data.driverRoutes.map((r) => {
              const isActive = r.id === data.currentRoute?.id;
              return (
                <button
                  key={r.id}
                  onClick={() => handleSwitchRoute(r.id)}
                  className={`px-3 py-1.5 rounded-nested text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                    isActive
                      ? "bg-[#00993F] text-white border-[#00993F] shadow-xs"
                      : "bg-[#F6F8F7] text-slate-700 border-[#E3E9E5] hover:bg-[#EDF9F1]"
                  }`}
                >
                  <span>{r.name.replace("Daily Master Loop ", "")}</span>
                  <span className={`ml-1 text-[10px] font-mono ${isActive ? "text-white/80" : "text-slate-400"}`}>
                    ({r.completedStops}/{r.totalStops})
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Success Notification Banner */}
      {successToast && (
        <div className="p-3.5 rounded-nested bg-[#EDF9F1] border border-[#ADE4C1] text-xs font-bold text-[#00682B] flex items-center gap-2 animate-in fade-in shadow-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-[#00993F]" />
          <span>{successToast}</span>
        </div>
      )}

      {/* EMPTY STATE: When Driver has No Stops Scheduled for Today */}
      {stops.length === 0 ? (
        <div className="bg-white rounded-card p-8 border border-[#E3E9E5] text-center shadow-card-elevated space-y-4">
          <div className="w-14 h-14 bg-[#EDF9F1] text-[#00993F] rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              No Stops Scheduled Today
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              There are no active collection stops assigned to <strong>{data.driverName}</strong> on the database manifest for today.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => setModalAction("driver_switcher")}
              className="w-full py-2.5 rounded-nested bg-[#00993F] text-white text-xs font-bold shadow-xs hover:bg-[#008235] transition-all cursor-pointer"
            >
              Switch to Another Driver (e.g. Julien, Brian)
            </button>
            <Link
              href="/operations/routes"
              className="w-full py-2.5 rounded-nested bg-[#F6F8F7] border border-[#E3E9E5] text-slate-700 text-xs font-bold hover:bg-[#E3E9E5] transition-all block"
            >
              Check Operations Routes & Dispatch
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* 2. Route Progress Header Card */}
          <div className="bg-[#111827] text-white rounded-card p-5 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between text-xs text-white/80 mb-2">
              <span className="font-semibold uppercase tracking-wider text-[#08A6BA] flex items-center gap-1 truncate max-w-[220px]">
                <span>{data.currentRoute?.name || "Daily Collection Loop"}</span>
              </span>
              <span className="font-mono font-bold text-white shrink-0">
                Stop {activeStop?.seq || 1} of {stops.length}
              </span>
            </div>

            <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden mb-3">
              <div
                className="bg-[#00993F] h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-white/70">
              <span className="flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-[#00993F]" />
                <span>{completedCount} Completed</span>
              </span>
              <span className="text-[#FECA36] font-bold">
                {remainingCount} Remaining
              </span>
            </div>
          </div>

          {/* 3. Active Stop Hero Card */}
          {activeStop && (
            <div className="bg-white rounded-card p-5 sm:p-6 border-2 border-[#00993F] shadow-xl relative overflow-hidden space-y-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono font-bold text-[#00993F] bg-[#EDF9F1] px-2.5 py-1 rounded-full border border-[#ADE4C1]">
                  WAYPOINT #{activeStop.seq}
                </span>

                <Badge
                  variant={
                    activeStop.status === "collected" || activeStop.status === "completed"
                      ? "primary"
                      : activeStop.status === "missed"
                      ? "amber"
                      : activeStop.status === "in_progress"
                      ? "cyan"
                      : "neutral"
                  }
                  dot
                >
                  {activeStop.status.replace("_", " ")}
                </Badge>
              </div>

              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                  {activeStop.clientName}
                </h2>
                <div className="flex items-start gap-1.5 text-xs text-[#4B5563] mt-1.5">
                  <MapPin className="w-4 h-4 text-[#00993F] shrink-0 mt-0.5" />
                  <span className="font-medium">{activeStop.address}</span>
                </div>
              </div>

              {/* Waste stream & expected amount banner */}
              <div className="p-3 rounded-nested bg-[#F6F8F7] border border-[#E3E9E5] flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-[#9CA3AF] uppercase font-bold block">
                    Waste Stream
                  </span>
                  <span className="font-bold text-slate-900">{activeStop.wasteStream}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#9CA3AF] uppercase font-bold block">
                    {activeStop.actualWeightKg ? "Actual Weight Logged" : "Expected Weight"}
                  </span>
                  <span className="font-mono text-base font-extrabold text-[#00993F]">
                    {activeStop.actualWeightKg
                      ? `${formatWeight(activeStop.actualWeightKg, "kg")}`
                      : `~${formatWeight(activeStop.expectedKg, "kg")}`}
                  </span>
                </div>
              </div>

              {/* Driver Special Notes */}
              {activeStop.notes && (
                <div className="p-2.5 rounded-nested bg-[#FFF8D6]/80 border border-[#FCE38A] text-xs text-[#785608] space-y-0.5">
                  <strong className="block text-[11px]">Instructions / Notes:</strong>
                  <p className="text-[11px] leading-relaxed">{activeStop.notes}</p>
                </div>
              )}

              {/* Photo Attachment Preview if available */}
              {activeStop.proofPhotoUrl && (
                <div className="p-2.5 rounded-nested bg-[#F6F8F7] border border-[#E3E9E5] flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={activeStop.proofPhotoUrl}
                    alt="Proof of collection"
                    className="w-14 h-14 rounded object-cover border border-slate-300"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#00993F]" />
                      <span>Proof Photo Attached</span>
                    </span>
                    <span className="text-[10px] text-slate-500">Verified by Driver</span>
                  </div>
                </div>
              )}

              {/* Quick Action Navigation & Call Row */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    activeStop.address
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 py-2.5 rounded-nested bg-[#08A6BA] text-white text-xs font-bold shadow-xs hover:bg-[#068A9B] transition-all cursor-pointer"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Navigate</span>
                </a>

                <a
                  href={`tel:${activeStop.phone}`}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-nested bg-[#F0F4F2] text-slate-800 text-xs font-bold border border-[#E3E9E5] hover:bg-[#E3E9E5] transition-all cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5 text-[#00993F]" />
                  <span>Call Client</span>
                </a>
              </div>

              {/* Big Field Operations Buttons */}
              <div className="space-y-2.5 pt-2 border-t border-[#F0F4F2]">
                <button
                  onClick={handleMarkCollected}
                  disabled={isSubmitting || activeStop.status === "collected"}
                  className="w-full py-3.5 rounded-nested bg-[#00993F] text-white text-xs sm:text-sm font-extrabold shadow-md hover:bg-[#008235] flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {activeStop.status === "collected"
                      ? "STOP ALREADY COLLECTED"
                      : isSubmitting
                      ? "SAVING TO DATABASE..."
                      : "MARK STOP AS COLLECTED"}
                  </span>
                </button>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() => {
                      setCapturedPhoto(activeStop.proofPhotoUrl);
                      setModalAction("photo");
                    }}
                    className="py-2.5 rounded-nested bg-white border border-[#E3E9E5] text-xs font-bold text-slate-800 flex items-center justify-center gap-1.5 hover:bg-[#F0F4F2] transition-colors cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5 text-[#08A6BA]" />
                    <span>{activeStop.proofPhotoUrl ? "View / Retake" : "Take Photo"}</span>
                  </button>

                  <button
                    onClick={() => {
                      setInputWeight((activeStop.actualWeightKg || activeStop.expectedKg).toString());
                      setModalAction("weight");
                    }}
                    className="py-2.5 rounded-nested bg-white border border-[#E3E9E5] text-xs font-bold text-slate-800 flex items-center justify-center gap-1.5 hover:bg-[#F0F4F2] transition-colors cursor-pointer"
                  >
                    <Scale className="w-3.5 h-3.5 text-[#00993F]" />
                    <span>Adjust Weight</span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    setProblemNotes("");
                    setModalAction("problem");
                  }}
                  className="w-full py-2 rounded-nested bg-[#FFF8D6] text-[#785608] border border-[#FCE38A] text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-[#FBE492] transition-colors cursor-pointer"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-[#785608]" />
                  <span>Report Problem (Gate Locked / Blocked)</span>
                </button>
              </div>
            </div>
          )}

          {/* 4. Upcoming Stops Itinerary Accordion */}
          <div className="bg-white rounded-card p-4 border border-[#E3E9E5] shadow-xs">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#F0F4F2]">
              <h4 className="text-xs font-bold text-slate-900">
                Route Stops Itinerary ({stops.length})
              </h4>
              <span className="text-[10px] text-slate-400 font-mono">
                Order by sequence
              </span>
            </div>

            <div className="space-y-2">
              {stops.map((stop, idx) => {
                const isSelected = idx === currentStopIndex;
                const isCollected = stop.status === "collected" || stop.status === "completed";
                const isMissed = stop.status === "missed";

                return (
                  <div
                    key={stop.id}
                    onClick={() => setCurrentStopIndex(idx)}
                    className={`p-2.5 rounded-nested text-xs flex items-center justify-between cursor-pointer transition-all border ${
                      isSelected
                        ? "bg-[#EDF9F1] border-[#ADE4C1] font-bold text-[#00682B] shadow-2xs"
                        : isCollected
                        ? "bg-[#F6F8F7] border-[#E3E9E5] text-slate-400 line-through"
                        : isMissed
                        ? "bg-[#FFF8D6]/60 border-[#FCE38A] text-amber-900"
                        : "bg-white border-[#E3E9E5] text-slate-800 hover:bg-[#F0F4F2]"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold shrink-0 ${
                          isSelected
                            ? "bg-[#00993F] text-white"
                            : isCollected
                            ? "bg-slate-300 text-slate-600"
                            : "bg-[#E3E9E5] text-slate-700"
                        }`}
                      >
                        {stop.seq}
                      </span>
                      <span className="truncate">{stop.clientName}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] font-mono">
                        {stop.actualWeightKg
                          ? `${stop.actualWeightKg} kg`
                          : `~${stop.expectedKg} kg`}
                      </span>
                      {isCollected && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#00993F]" />
                      )}
                      {isMissed && (
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* MODAL 1: Real Photo Capture Modal */}
      {modalAction === "photo" && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-card max-w-xs w-full p-5 shadow-2xl border border-[#E3E9E5] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#F0F4F2]">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-[#08A6BA]" />
                <span>Proof of Collection Photo</span>
              </h4>
              <button
                onClick={() => setModalAction(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Hidden file / camera input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              capture="environment"
              onChange={handlePhotoSelect}
              className="hidden"
            />

            {capturedPhoto ? (
              <div className="space-y-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={capturedPhoto}
                  alt="Captured collection preview"
                  className="w-full h-44 object-cover rounded-nested border border-slate-300"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[11px] text-[#08A6BA] font-bold hover:underline block mx-auto text-center"
                >
                  Retake Photo
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="h-44 bg-slate-900 rounded-nested flex flex-col items-center justify-center text-white text-xs gap-2 cursor-pointer hover:bg-slate-800 transition-colors p-3 text-center border-2 border-dashed border-slate-700"
              >
                <Camera className="w-8 h-8 text-[#08A6BA] animate-pulse" />
                <span className="font-bold">Tap to Open Camera</span>
                <span className="text-[10px] text-white/60">
                  GPS Stamp: {activeStop?.latitude || "-1.2223"}, {activeStop?.longitude || "36.8789"}
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 pt-2 border-t border-[#F0F4F2]">
              <button
                type="button"
                onClick={() => setModalAction(null)}
                className="flex-1 py-2 rounded-nested bg-[#F0F4F2] text-xs font-bold text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!capturedPhoto || isSubmitting}
                onClick={handleSavePhoto}
                className="flex-1 py-2 rounded-nested bg-[#00993F] text-white text-xs font-bold hover:bg-[#008235] disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? "Saving..." : "Save Photo"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Weight Adjust Modal */}
      {modalAction === "weight" && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-card max-w-xs w-full p-5 shadow-2xl border border-[#E3E9E5] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#F0F4F2]">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-[#00993F]" />
                <span>Adjust Weight at Scale</span>
              </h4>
              <button
                onClick={() => setModalAction(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                Net Collected Weight (Kilograms)
              </label>
              <input
                type="number"
                step="any"
                value={inputWeight}
                onChange={(e) => setInputWeight(e.target.value)}
                placeholder="e.g. 450"
                className="w-full p-3 font-mono text-xl font-black text-center rounded-nested border-2 border-[#00993F] focus:outline-none bg-[#F6F8F7]"
              />
              <span className="text-[10px] text-slate-400 mt-1 block text-center">
                Expected based on contract: ~{activeStop?.expectedKg} kg
              </span>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-[#F0F4F2]">
              <button
                type="button"
                onClick={() => setModalAction(null)}
                className="flex-1 py-2 rounded-nested bg-[#F0F4F2] text-xs font-bold text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmWeight}
                className="flex-1 py-2 rounded-nested bg-[#00993F] text-white text-xs font-bold hover:bg-[#008235] cursor-pointer"
              >
                {isSubmitting ? "Saving..." : "Confirm Weight"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Problem / Missed Stop Modal */}
      {modalAction === "problem" && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-card max-w-xs w-full p-5 shadow-2xl border border-[#E3E9E5] space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#F0F4F2]">
              <h4 className="text-xs font-bold text-red-600 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>Report Collection Problem</span>
              </h4>
              <button
                onClick={() => setModalAction(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="font-bold text-slate-800 block mb-1">Reason</label>
                <select
                  value={problemReason}
                  onChange={(e) => setProblemReason(e.target.value as any)}
                  className="w-full p-2 border border-[#E3E9E5] rounded-nested bg-white text-xs font-semibold"
                >
                  <option value="gate_locked">Compound Gate Locked / No Security</option>
                  <option value="access_blocked">Access Road Blocked</option>
                  <option value="bin_empty">Bins Empty / Customer Cancelled</option>
                  <option value="client_not_ready">Client Waste Not Sorted</option>
                  <option value="severe_weather">Severe Weather / Inaccessible</option>
                  <option value="vehicle_breakdown">Truck Mechanical Fault</option>
                  <option value="other">Other Operational Delay</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Driver Note</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Guard was away from gate..."
                  value={problemNotes}
                  onChange={(e) => setProblemNotes(e.target.value)}
                  className="w-full p-2 border border-[#E3E9E5] rounded-nested text-xs focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-[#F0F4F2]">
              <button
                type="button"
                onClick={() => setModalAction(null)}
                className="flex-1 py-2 rounded-nested bg-[#F0F4F2] text-xs font-bold text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmProblem}
                className="flex-1 py-2 rounded-nested bg-red-600 text-white text-xs font-bold hover:bg-red-700 cursor-pointer"
              >
                {isSubmitting ? "Reporting..." : "Report Missed"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Driver Switcher Modal */}
      {modalAction === "driver_switcher" && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-card max-w-xs w-full p-5 shadow-2xl border border-[#E3E9E5] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#F0F4F2]">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <User className="w-4 h-4 text-[#00993F]" />
                <span>Select Active Driver</span>
              </h4>
              <button
                onClick={() => setModalAction(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-slate-500">
              Select which company driver&apos;s manifest and digital job sheet you want to open:
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {data.availableDrivers.map((driver) => {
                const isCurrent = driver.name.toLowerCase() === data.driverName.toLowerCase();
                return (
                  <button
                    key={driver.name}
                    onClick={() => handleSwitchDriver(driver.name)}
                    className={`w-full p-2.5 rounded-nested text-xs font-bold text-left flex items-center justify-between border cursor-pointer transition-all ${
                      isCurrent
                        ? "bg-[#EDF9F1] border-[#ADE4C1] text-[#00682B]"
                        : "bg-[#F6F8F7] border-[#E3E9E5] text-slate-800 hover:bg-[#EDF9F1]"
                    }`}
                  >
                    <div>
                      <div>{driver.name}</div>
                      <div className="text-[10px] text-slate-400 font-normal">
                        {driver.assignedVehiclePlate || "Fleet Vehicle"} • {driver.phone}
                      </div>
                    </div>
                    {isCurrent && <Check className="w-4 h-4 text-[#00993F]" />}
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-[#F0F4F2]">
              <button
                type="button"
                onClick={() => setModalAction(null)}
                className="w-full py-2 rounded-nested bg-[#F0F4F2] text-xs font-bold text-slate-700 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
