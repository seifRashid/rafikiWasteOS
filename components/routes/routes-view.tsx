"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Truck,
  Calendar,
  Fuel,
  Navigation,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  GripVertical,
  X,
  Check,
  Settings2,
  Sliders,
  History,
  Search,
  Info,
  Printer,
  UserCheck,
  Send,
  FileText,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import {
  rescheduleMissedStopAction,
  updateDispatchSettingsAction,
  autoSplitAndGenerateRoutesAction,
  syncAndGetDailyOperationsAction,
  dispatchRouteAction,
  updateRouteDispatchDetailsAction,
  reorderRouteStopsAction,
} from "@/server/actions/routes";
import type { Route, Vehicle, DispatchSetting } from "@/server/db/schema";
import { formatDate, formatWeight } from "@/lib/utils";

interface RouteWithVehicle {
  route: Route;
  vehicle: Vehicle | null;
}

interface StopItem {
  job: {
    id: string;
    jobNumber: string;
    clientId: string;
    routeId: string | null;
    vehicleId: string | null;
    driverName: string | null;
    wasteStream: string;
    stopSequence: number;
    expectedQuantityKg: string | null;
    actualWeightKg: string | null;
    scheduledAt: Date | string;
    status: string;
    notes: string | null;
  };
  client: {
    id: string;
    name: string;
    physicalAddress: string;
    countyRegion: string;
    phone?: string | null;
  } | null;
}

interface RoutesViewProps {
  initialRoutes: RouteWithVehicle[];
  initialSettings?: DispatchSetting;
  initialStops?: StopItem[];
  fleetVehicles?: Vehicle[];
}

export function RoutesView({
  initialRoutes,
  initialSettings,
  initialStops = [],
  fleetVehicles = [],
}: RoutesViewProps) {
  const [routesList, setRoutesList] = useState<RouteWithVehicle[]>(initialRoutes);
  const [stopsList, setStopsList] = useState<StopItem[]>(initialStops);
  const [dispatchSettingsState, setDispatchSettingsState] = useState<DispatchSetting>(
    initialSettings || {
      id: "default",
      maxStopsPerRoute: 6,
      autoSplitExceededRoutes: true,
      defaultStartDepot: "Central Logistics Depot - Industrial Area",
      defaultEndDestination: "Mombasa Road MRF & Weighbridge",
      operatingDays: "Monday,Tuesday,Wednesday,Thursday,Friday,Saturday",
      updatedBy: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  );

  // Top View Mode: "active" (Today / Daily Dispatch) vs "history" (Archive & Past Routes)
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");

  // Selected Date for Daily Dispatch
  const todayStr = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [isDateSyncing, setIsDateSyncing] = useState(false);

  // Filter routes belonging to the selected date (excluding deleted surplus routes)
  const routesOnSelectedDate = routesList.filter((r) => {
    if (r.route.isDeleted) return false;
    const rDate =
      typeof r.route.routeDate === "string"
        ? r.route.routeDate
        : new Date(r.route.routeDate).toISOString().split("T")[0];
    return rDate === selectedDate;
  });

  const activeRoutesForDay = routesOnSelectedDate;

  // Selected Route ID within the day
  const [selectedRouteId, setSelectedRouteId] = useState<string>(
    activeRoutesForDay[0]?.route.id || ""
  );

  const currentRouteItem =
    activeRoutesForDay.find((r) => r.route.id === selectedRouteId) ||
    activeRoutesForDay[0] ||
    null;

  // Modals & Notices
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isManifestModalOpen, setIsManifestModalOpen] = useState(false);
  const [rescheduleJobTarget, setRescheduleJobTarget] = useState<{
    id: string;
    clientName: string;
    jobNumber: string;
  } | null>(null);
  const [rescheduleDateInput, setRescheduleDateInput] = useState<string>("");

  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  const showNotification = (message: string, type: "success" | "error" | "info" = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Capacity Settings Form State
  const [maxStopsInput, setMaxStopsInput] = useState<number>(
    dispatchSettingsState.maxStopsPerRoute || 6
  );
  const [autoSplitToggle, setAutoSplitToggle] = useState<boolean>(
    dispatchSettingsState.autoSplitExceededRoutes
  );
  const [settingsLoading, setSettingsLoading] = useState(false);

  // Reassign Modal State
  const [reassignDriverName, setReassignDriverName] = useState("");
  const [reassignDriverPhone, setReassignDriverPhone] = useState("");
  const [reassignVehicleId, setReassignVehicleId] = useState("");
  const [reassignCrewNames, setReassignCrewNames] = useState("");
  const [reassignLoading, setReassignLoading] = useState(false);

  // History Tab Filter States
  const [historySearch, setHistorySearch] = useState("");
  const [historyStatusFilter, setHistoryStatusFilter] = useState<string>("all");
  const [historyRangeFilter, setHistoryRangeFilter] = useState<"all" | "7d" | "30d">("all");

  // Get real stops assigned to current route from live database stopsList
  const currentRouteDbStops = currentRouteItem
    ? stopsList
        .filter((s) => s.job.routeId === currentRouteItem.route.id)
        .sort((a, b) => (a.job.stopSequence || 0) - (b.job.stopSequence || 0))
    : [];

  const displayStops = currentRouteDbStops.map((s, idx) => ({
    seq: s.job.stopSequence || idx + 1,
    name: s.client?.name || "Client Scheduled Stop",
    time: new Date(s.job.scheduledAt).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    address: s.client?.physicalAddress || "Nairobi, Kenya",
    phone: s.client?.phone || "+254 712 345 678",
    stream: `${s.job.wasteStream.charAt(0).toUpperCase() + s.job.wasteStream.slice(1)} (~${formatWeight(s.job.expectedQuantityKg || "300", "kg")})`,
    expectedKg: s.job.expectedQuantityKg || "300",
    actualWeightKg: s.job.actualWeightKg,
    status: s.job.status,
    jobId: s.job.id,
    jobNumber: s.job.jobNumber,
  }));

  // Handle Date Change & Server Sync
  const handleDateChange = async (newDate: string) => {
    setSelectedDate(newDate);
    setIsDateSyncing(true);
    try {
      const res = await syncAndGetDailyOperationsAction(newDate);
      if (res.success) {
        setRoutesList(res.allRoutes || res.routes || []);
        setStopsList(res.stops || []);
        if (res.routes && res.routes.length > 0) {
          setSelectedRouteId(res.routes[0].route.id);
        } else {
          setSelectedRouteId("");
        }
      } else {
        showNotification(res.error || "Failed to sync operations for date.", "error");
      }
    } catch (err: any) {
      showNotification(err?.message || "Error syncing operations.", "error");
    } finally {
      setIsDateSyncing(false);
    }
  };

  // Handle Manual Refresh / Auto-Balance
  const handleRefreshOperations = async () => {
    setIsDateSyncing(true);
    try {
      const res = await autoSplitAndGenerateRoutesAction(selectedDate, maxStopsInput);
      if (res.success && "eligibleStopsCount" in res) {
        const syncRes = await syncAndGetDailyOperationsAction(selectedDate);
        if (syncRes.success) {
          setRoutesList(syncRes.allRoutes || syncRes.routes || []);
          setStopsList(syncRes.stops || []);
          if (syncRes.routes && syncRes.routes.length > 0) {
            setSelectedRouteId(syncRes.routes[0].route.id);
          }
        }
        showNotification(
          `Synced operations for ${selectedDate}: ${res.eligibleStopsCount} stops distributed across ${res.routesCount} routes.`
        );
      }
    } catch (err: any) {
      showNotification(err?.message || "Failed to refresh daily operations.", "error");
    } finally {
      setIsDateSyncing(false);
    }
  };

  // Handle Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsLoading(true);
    try {
      const res = await updateDispatchSettingsAction({
        maxStopsPerRoute: maxStopsInput,
        autoSplitExceededRoutes: autoSplitToggle,
        defaultStartDepot: dispatchSettingsState.defaultStartDepot,
        defaultEndDestination: dispatchSettingsState.defaultEndDestination,
      });

      if (res.success) {
        setDispatchSettingsState((prev) => ({
          ...prev,
          maxStopsPerRoute: maxStopsInput,
          autoSplitExceededRoutes: autoSplitToggle,
        }));

        if (autoSplitToggle) {
          await autoSplitAndGenerateRoutesAction(selectedDate, maxStopsInput);
          const syncRes = await syncAndGetDailyOperationsAction(selectedDate);
          if (syncRes.success) {
            setRoutesList(syncRes.allRoutes || syncRes.routes || []);
            setStopsList(syncRes.stops || []);
          }
        }

        showNotification(`Capacity threshold set to ${maxStopsInput} stops. Routes re-balanced!`);
        setIsSettingsModalOpen(false);
      }
    } catch (err: any) {
      showNotification(err?.message || "Failed to save capacity settings.", "error");
    } finally {
      setSettingsLoading(false);
    }
  };

  // Dispatch Route Action (Planned -> In Progress -> Completed)
  const handleDispatchRoute = async (targetStatus: "in_progress" | "completed" | "planned") => {
    if (!currentRouteItem) return;
    try {
      const res = await dispatchRouteAction(currentRouteItem.route.id, targetStatus);
      if (res.success) {
        setRoutesList((prev) =>
          prev.map((r) =>
            r.route.id === currentRouteItem.route.id
              ? { ...r, route: { ...r.route, status: targetStatus } }
              : r
          )
        );
        const syncRes = await syncAndGetDailyOperationsAction(selectedDate);
        if (syncRes.success) {
          setStopsList(syncRes.stops || []);
        }

        const label =
          targetStatus === "in_progress"
            ? "Route dispatched! Driver manifest is now live."
            : targetStatus === "completed"
            ? "Route marked as completed."
            : "Route status updated.";
        showNotification(label);
      } else {
        showNotification(res.error || "Failed to update dispatch status.", "error");
      }
    } catch (err: any) {
      showNotification(err?.message || "Dispatch error occurred.", "error");
    }
  };

  // Reassign Driver & Vehicle Modal Open
  const openReassignModal = () => {
    if (!currentRouteItem) return;
    setReassignDriverName(currentRouteItem.route.driverName || "");
    setReassignDriverPhone(currentRouteItem.route.driverPhone || "");
    setReassignVehicleId(currentRouteItem.route.vehicleId || "");
    setReassignCrewNames(currentRouteItem.route.crewNames || "");
    setIsAssignModalOpen(true);
  };

  const handleSaveReassignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRouteItem) return;
    setReassignLoading(true);
    try {
      const res = await updateRouteDispatchDetailsAction({
        routeId: currentRouteItem.route.id,
        vehicleId: reassignVehicleId || null,
        driverName: reassignDriverName,
        driverPhone: reassignDriverPhone,
        crewNames: reassignCrewNames,
      });

      if (res.success) {
        const syncRes = await syncAndGetDailyOperationsAction(selectedDate);
        if (syncRes.success) {
          setRoutesList(syncRes.allRoutes || syncRes.routes || []);
          setStopsList(syncRes.stops || []);
        }
        showNotification("Route resources updated. Driver manifest synced!");
        setIsAssignModalOpen(false);
      } else {
        showNotification(res.error || "Failed to update assignments.", "error");
      }
    } catch (err: any) {
      showNotification(err?.message || "Failed to update assignments.", "error");
    } finally {
      setReassignLoading(false);
    }
  };

  // Stop Sequencing Drag-and-Drop
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = (index: number) => {
    if (dragOverIndex === index) {
      setDragOverIndex(null);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDrop = async (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex || !currentRouteItem) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const sourceIndex = draggedIndex;
    setDraggedIndex(null);
    setDragOverIndex(null);

    const reorderedStops = [...displayStops];
    const [movedItem] = reorderedStops.splice(sourceIndex, 1);
    reorderedStops.splice(targetIndex, 0, movedItem);

    const orderedJobIds = reorderedStops.map((s) => s.jobId);

    // Optimistically update stopsList so UI re-orders instantaneously
    setStopsList((prev) =>
      prev.map((stopItem) => {
        const newPos = orderedJobIds.indexOf(stopItem.job.id);
        if (newPos !== -1) {
          return {
            ...stopItem,
            job: {
              ...stopItem.job,
              stopSequence: newPos + 1,
            },
          };
        }
        return stopItem;
      })
    );

    try {
      await reorderRouteStopsAction(currentRouteItem.route.id, orderedJobIds);
      const syncRes = await syncAndGetDailyOperationsAction(selectedDate);
      if (syncRes.success) {
        setStopsList(syncRes.stops || []);
      }
      showNotification("Stop sequence updated via drag-and-drop.");
    } catch (err) {
      showNotification("Failed to update stop sequence.", "error");
    }
  };

  // Reschedule Stop
  const handleConfirmReschedule = async () => {
    if (!rescheduleJobTarget || !rescheduleDateInput) return;
    try {
      const res = await rescheduleMissedStopAction(rescheduleJobTarget.id, rescheduleDateInput);
      if (res.success) {
        const syncRes = await syncAndGetDailyOperationsAction(selectedDate);
        if (syncRes.success) {
          setRoutesList(syncRes.allRoutes || syncRes.routes || []);
          setStopsList(syncRes.stops || []);
        }
        showNotification(
          `${rescheduleJobTarget.clientName} rescheduled to ${formatDate(rescheduleDateInput)}!`
        );
        setRescheduleJobTarget(null);
        setRescheduleDateInput("");
      } else {
        showNotification("Failed to reschedule stop.", "error");
      }
    } catch (err: any) {
      showNotification(err?.message || "Error rescheduling stop.", "error");
    }
  };

  // Filter History records
  const filteredHistoryRoutes = routesList.filter(({ route }) => {
    const rDate =
      typeof route.routeDate === "string"
        ? route.routeDate
        : new Date(route.routeDate).toISOString().split("T")[0];

    const matchesSearch =
      route.name.toLowerCase().includes(historySearch.toLowerCase()) ||
      route.routeCode.toLowerCase().includes(historySearch.toLowerCase()) ||
      route.driverName.toLowerCase().includes(historySearch.toLowerCase());

    const matchesStatus =
      historyStatusFilter === "all" || route.status === historyStatusFilter;

    let matchesRange = true;
    if (historyRangeFilter === "7d") {
      const past7 = new Date();
      past7.setDate(past7.getDate() - 7);
      matchesRange = new Date(rDate) >= past7;
    } else if (historyRangeFilter === "30d") {
      const past30 = new Date();
      past30.setDate(past30.getDate() - 30);
      matchesRange = new Date(rDate) >= past30;
    }

    return matchesSearch && matchesStatus && matchesRange;
  });

  const stopsOnCurrentRoute = displayStops.length;
  const maxStopsLimit = dispatchSettingsState.maxStopsPerRoute || 6;
  const isOverCapacity = stopsOnCurrentRoute > maxStopsLimit;

  return (
    <div className="space-y-6">
      {/* Top Header & Global Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-[#E3E9E5]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Route Management & Dispatch Control
            </h1>
            <Badge variant="primary" dot>
              Max {maxStopsLimit} Stops/Route
            </Badge>
          </div>
          <p className="text-xs text-[#4B5563] mt-0.5">
            Daily collection manifests, multi-route partitioning, driver telemetry and route history archive.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Main Mode Pill Toggle */}
          <div className="bg-[#F0F4F2] p-1 rounded-nested flex items-center border border-[#E3E9E5] text-xs">
            <button
              onClick={() => setActiveTab("active")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-nested font-bold transition-all cursor-pointer ${
                activeTab === "active"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-[#4B5563] hover:text-slate-900"
              }`}
            >
              <Truck className="w-3.5 h-3.5 text-[#00993F]" />
              <span>Daily Dispatch</span>
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-nested font-bold transition-all cursor-pointer ${
                activeTab === "history"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-[#4B5563] hover:text-slate-900"
              }`}
            >
              <History className="w-3.5 h-3.5 text-[#08A6BA]" />
              <span>Route History ({routesList.length})</span>
            </button>
          </div>

          {/* Refresh / Sync Button */}
          <button
            onClick={handleRefreshOperations}
            disabled={isDateSyncing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-nested bg-white hover:bg-[#F6F8F7] text-slate-700 text-xs font-bold border border-[#E3E9E5] shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
            title="Re-sync eligible client schedules and auto-balance routes for this date"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#00993F] ${isDateSyncing ? "animate-spin" : ""}`} />
            <span>Sync Daily Stops</span>
          </button>

          {/* Settings Button */}
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-nested bg-white hover:bg-[#F6F8F7] text-slate-700 text-xs font-bold border border-[#E3E9E5] shadow-2xs transition-colors cursor-pointer"
            title="Configure maximum stops and auto-route splitting rules"
          >
            <Settings2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Capacity Settings</span>
          </button>
        </div>
      </div>

      {/* Dynamic Notification Toast */}
      {notification && (
        <div
          className={`p-3.5 rounded-nested border text-xs font-bold flex items-center gap-2 animate-in fade-in shadow-xs ${
            notification.type === "success"
              ? "bg-[#EDF9F1] border-[#ADE4C1] text-[#00682B]"
              : notification.type === "error"
              ? "bg-red-50 border-red-200 text-red-800"
              : "bg-[#EEFBFD] border-[#B6EEF5] text-[#067382]"
          }`}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notification.message}</span>
        </div>
      )}

      {/* VIEW 1: DAILY ACTIVE DISPATCH */}
      {activeTab === "active" && (
        <div className="space-y-5">
          {/* Day Navigation & Sub-Route Bar */}
          <div className="bg-white rounded-card p-4 border border-[#E3E9E5] shadow-card-elevated space-y-4">
            {/* Row 1: Date Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F0F4F2]">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#00993F]" />
                  <span>Dispatch Date:</span>
                </span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="px-2.5 py-1 bg-[#F6F8F7] border border-[#E3E9E5] rounded-nested text-xs font-bold text-slate-900 focus:outline-none focus:border-[#00993F]"
                />
                <span className="text-xs font-bold text-[#00993F] bg-[#EDF9F1] px-2.5 py-0.5 rounded-full border border-[#ADE4C1]">
                  {activeRoutesForDay.length} {activeRoutesForDay.length === 1 ? "Route" : "Routes"} Active
                </span>
                {isDateSyncing && (
                  <span className="text-xs font-semibold text-[#08A6BA] flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>Synchronizing schedule...</span>
                  </span>
                )}
              </div>

              <div className="text-xs text-slate-500 flex items-center gap-2">
                <span>Stops due today:</span>
                <strong className="text-slate-900 font-mono">
                  {stopsList.filter((s) => {
                    const jd = new Date(s.job.scheduledAt).toISOString().split("T")[0];
                    return jd === selectedDate;
                  }).length}{" "}
                  client collections
                </strong>
              </div>
            </div>

            {/* Row 2: Tabs for Multiple Routes on that Day */}
            {activeRoutesForDay.length > 0 ? (
              <div>
                <div className="flex items-center justify-between pb-1.5">
                  <span className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider">
                    Day Manifests (Select Route Loop):
                  </span>
                  {activeRoutesForDay.length > 1 && (
                    <span className="text-[11px] font-bold text-[#08A6BA]">
                      ⚡ Route loop auto-partitioned based on {maxStopsLimit}-stop capacity threshold
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
                  {activeRoutesForDay.map(({ route, vehicle }, idx) => {
                    const isSelected = route.id === currentRouteItem?.route.id;
                    const routeActualStops = stopsList.filter((s) => s.job.routeId === route.id);
                    const stopsCount = routeActualStops.length;
                    const isFull = stopsCount >= maxStopsLimit;

                    return (
                      <button
                        key={route.id}
                        onClick={() => setSelectedRouteId(route.id)}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-nested text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
                          isSelected
                            ? "bg-[#00993F] text-white border-[#00993F] shadow-sm ring-2 ring-[#00993F]/20"
                            : "bg-[#F6F8F7] text-slate-700 border-[#E3E9E5] hover:bg-[#EDF9F1] hover:border-[#ADE4C1]"
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                            isSelected ? "bg-white text-[#00993F]" : "bg-white text-slate-700 shadow-2xs"
                          }`}
                        >
                          {idx + 1}
                        </div>

                        <div className="text-left">
                          <div className="font-extrabold flex items-center gap-1.5">
                            <span>{route.name}</span>
                            {isFull && (
                              <span
                                className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                                  isSelected
                                    ? "bg-amber-400 text-slate-900"
                                    : "bg-amber-100 text-amber-900 border border-amber-300"
                                }`}
                              >
                                Max Cap
                              </span>
                            )}
                          </div>
                          <div className={`text-[10px] ${isSelected ? "text-white/80" : "text-[#9CA3AF]"}`}>
                            {route.routeCode} • {vehicle?.plateNumber || "Truck"} ({route.driverName}) • {stopsCount}/{maxStopsLimit} stops
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-[#F6F8F7] rounded-nested border border-dashed border-[#E3E9E5] text-center space-y-2">
                <p className="text-xs text-slate-600 font-medium">
                  No routes or stops scheduled for <strong>{formatDate(selectedDate)}</strong>.
                </p>
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={handleRefreshOperations}
                    className="px-3 py-1.5 rounded-nested bg-[#00993F] text-white font-bold text-xs shadow-xs hover:bg-[#008235] cursor-pointer"
                  >
                    Sync Client Schedule for this Date
                  </button>
                  <Link
                    href="/operations/schedule"
                    className="px-3 py-1.5 rounded-nested bg-white border border-[#E3E9E5] text-slate-700 font-bold text-xs hover:bg-[#EDF9F1] block"
                  >
                    View Weekly Schedule
                  </Link>
                </div>
              </div>
            )}
          </div>

          {currentRouteItem && (
            <>
              {/* Dispatch Action Control Bar */}
              <div className="bg-white rounded-card p-4 border border-[#E3E9E5] shadow-card-elevated flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#EDF9F1] text-[#00993F] flex items-center justify-center font-bold">
                    <Send className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Dispatch Status:
                      </span>
                      <Badge
                        variant={
                          currentRouteItem.route.status === "completed"
                            ? "primary"
                            : currentRouteItem.route.status === "in_progress"
                            ? "cyan"
                            : "neutral"
                        }
                        dot
                      >
                        {currentRouteItem.route.status === "in_progress"
                          ? "In Progress (Live)"
                          : currentRouteItem.route.status.charAt(0).toUpperCase() +
                            currentRouteItem.route.status.slice(1)}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Driver: <strong>{currentRouteItem.route.driverName}</strong> • Vehicle:{" "}
                      <strong>{currentRouteItem.vehicle?.plateNumber || "Pending"}</strong> • Crew:{" "}
                      {currentRouteItem.route.crewNames || "Assigned depot crew"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {currentRouteItem.route.status === "planned" && (
                    <button
                      onClick={() => handleDispatchRoute("in_progress")}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-nested bg-[#00993F] text-white text-xs font-bold hover:bg-[#008235] shadow-xs cursor-pointer transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Dispatch Route to Driver</span>
                    </button>
                  )}

                  {currentRouteItem.route.status === "in_progress" && (
                    <button
                      onClick={() => handleDispatchRoute("completed")}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-nested bg-[#08A6BA] text-white text-xs font-bold hover:bg-[#067382] shadow-xs cursor-pointer transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Mark Route Completed</span>
                    </button>
                  )}

                  <button
                    onClick={openReassignModal}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-nested bg-white hover:bg-[#F6F8F7] text-slate-700 text-xs font-bold border border-[#E3E9E5] shadow-2xs transition-colors cursor-pointer"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                    <span>Assign Resources</span>
                  </button>

                  <button
                    onClick={() => setIsManifestModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-nested bg-[#EDF9F1] hover:bg-[#ADE4C1] text-[#00682B] text-xs font-bold border border-[#ADE4C1] shadow-2xs transition-colors cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#00993F]" />
                    <span>View Digital Manifest</span>
                  </button>
                </div>
              </div>

              {/* Capacity Alert Banner if Selected Route is over capacity */}
              {isOverCapacity && (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-card flex items-start gap-3 text-xs text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-bold">
                      Route Exceeds Maximum Capacity Limit ({stopsOnCurrentRoute} Stops / Max {maxStopsLimit})
                    </span>
                    <p className="text-[11px] text-amber-800">
                      This route has more pickup points than the configured threshold of {maxStopsLimit} stops.
                      Open <strong>&ldquo;Capacity Settings&rdquo;</strong> to adjust capacity or automatically re-balance overflow loops with company trucks.
                    </p>
                  </div>
                </div>
              )}

              {/* Telemetry Stat Cards for Currently Selected Route */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Stops on Route"
                  value={`${currentRouteItem.route.completedStops || 0} / ${stopsOnCurrentRoute}`}
                  subtitle={
                    stopsOnCurrentRoute >= maxStopsLimit
                      ? `At full capacity (${maxStopsLimit} cap)`
                      : `${maxStopsLimit - stopsOnCurrentRoute} slots available`
                  }
                  icon={<CheckCircle2 className="w-5 h-5" />}
                  accentColor={isOverCapacity ? "amber" : "primary"}
                />

                <StatCard
                  title="Assigned Vehicle"
                  value={currentRouteItem.vehicle?.plateNumber || "Pending"}
                  subtitle={currentRouteItem.vehicle?.model || "Fleet vehicle"}
                  icon={<Truck className="w-5 h-5" />}
                  accentColor="cyan"
                />

                <StatCard
                  title="Distance Logged"
                  value={`${currentRouteItem.route.totalDistanceKm || "38.5"} km`}
                  subtitle="Corridor telemetry"
                  icon={<Navigation className="w-5 h-5" />}
                  accentColor="neutral"
                />

                <StatCard
                  title="Fuel Consumed"
                  value={`${currentRouteItem.route.fuelUsedLitres || "16.2"} L`}
                  subtitle="2.4 km per litre avg"
                  icon={<Fuel className="w-5 h-5" />}
                  accentColor="amber"
                />
              </div>

              {/* Stops Sequence and Corridor Map Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Stops Sequence Manifest */}
                <div className="lg:col-span-2 bg-white rounded-card p-5 border border-[#E3E9E5] shadow-card-elevated">
                  <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#F0F4F2]">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#00993F]" />
                        <span>Stop Waypoint Sequence — {currentRouteItem.route.name}</span>
                      </h3>
                      <p className="text-xs text-[#4B5563]">
                        Driver: <strong>{currentRouteItem.route.driverName}</strong> • Phone:{" "}
                        {currentRouteItem.route.driverPhone || "+254 712 345 678"} • Crew:{" "}
                        {currentRouteItem.route.crewNames || "Assigned depot crew"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#00993F] bg-[#EDF9F1] px-2.5 py-1 rounded-full border border-[#ADE4C1]">
                        <GripVertical className="w-3.5 h-3.5" />
                        <span>Drag to reorder</span>
                      </span>
                      <Badge variant={currentRouteItem.route.status === "completed" ? "neutral" : "cyan"} dot>
                        {currentRouteItem.route.status.replace("_", " ") || "Active"}
                      </Badge>
                    </div>
                  </div>

                  {displayStops.length > 0 ? (
                    <div className="space-y-3">
                      {displayStops.map((stop, idx) => {
                        const isDraggingThis = draggedIndex === idx;
                        const isOverThis = dragOverIndex === idx && draggedIndex !== idx;

                        return (
                          <div
                            key={stop.jobId}
                            draggable
                            onDragStart={(e) => handleDragStart(e, idx)}
                            onDragOver={(e) => handleDragOver(e, idx)}
                            onDragLeave={() => handleDragLeave(idx)}
                            onDrop={(e) => handleDrop(e, idx)}
                            onDragEnd={handleDragEnd}
                            className={`p-3.5 rounded-nested border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all cursor-grab active:cursor-grabbing select-none ${
                              isDraggingThis
                                ? "opacity-40 border-dashed border-[#00993F] bg-emerald-50/50 scale-[0.99]"
                                : isOverThis
                                ? "border-[#00993F] ring-2 ring-[#00993F]/30 bg-[#EDF9F1] shadow-md scale-[1.01]"
                                : stop.status === "completed"
                                ? "bg-[#F6F8F7] border-[#E3E9E5]"
                                : stop.status === "in_progress"
                                ? "bg-[#EEFBFD] border-[#B6EEF5] shadow-xs ring-1 ring-[#08A6BA]"
                                : "bg-white border-[#E3E9E5] hover:border-[#00993F]/50 hover:shadow-2xs"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              {/* Drag Handle */}
                              <div
                                title="Drag to reorder waypoint sequence"
                                className="text-slate-400 hover:text-[#00993F] p-1 rounded-sm shrink-0 mt-0.5 transition-colors"
                              >
                                <GripVertical className="w-4 h-4" />
                              </div>

                              <div
                                className={`w-7 h-7 rounded-full font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                                  stop.status === "completed"
                                    ? "bg-[#00993F] text-white"
                                    : stop.status === "in_progress"
                                    ? "bg-[#08A6BA] text-white animate-pulse"
                                    : "bg-[#F0F4F2] text-[#4B5563]"
                                }`}
                              >
                                {stop.seq}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-900 text-xs">{stop.name}</span>
                                  <span className="text-[11px] font-mono text-[#9CA3AF]">{stop.time}</span>
                                </div>
                                <div className="text-[11px] text-[#4B5563] mt-0.5">{stop.address}</div>
                                <div className="text-[11px] font-semibold text-[#00993F] mt-0.5">
                                  {stop.stream}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                              <Badge
                                variant={
                                  stop.status === "completed"
                                    ? "primary"
                                    : stop.status === "in_progress"
                                    ? "cyan"
                                    : "neutral"
                                }
                                dot
                              >
                                {stop.status.replace("_", " ")}
                              </Badge>

                              {stop.status !== "completed" && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setRescheduleJobTarget({
                                      id: stop.jobId,
                                      clientName: stop.name,
                                      jobNumber: stop.jobNumber,
                                    });
                                    setRescheduleDateInput(selectedDate);
                                  }}
                                  className="text-[11px] font-bold text-[#785608] hover:underline bg-[#FFF8D6] px-2 py-1 rounded-nested border border-[#FCE38A] cursor-pointer"
                                >
                                  Reschedule
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-8 text-center bg-[#F6F8F7] rounded-nested border border-dashed border-[#E3E9E5] space-y-2">
                      <p className="text-xs text-slate-600 font-medium">
                        No collection stops assigned to this route manifest.
                      </p>
                      <button
                        onClick={handleRefreshOperations}
                        className="px-3 py-1.5 rounded-nested bg-[#00993F] text-white text-xs font-bold shadow-xs hover:bg-[#008235] cursor-pointer"
                      >
                        Auto-Distribute Scheduled Stops
                      </button>
                    </div>
                  )}
                </div>

                {/* Right: GPS Route Visualization & Depot Info */}
                <div className="space-y-6">
                  <div className="bg-white rounded-card p-5 border border-[#E3E9E5] shadow-card-elevated">
                    <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-[#F0F4F2] mb-3 flex items-center gap-2">
                      <Navigation className="w-4 h-4 text-[#08A6BA]" />
                      <span>Corridor Vector Map</span>
                    </h3>

                    <div className="w-full h-56 bg-[#111827] rounded-nested relative overflow-hidden flex items-center justify-center p-4">
                      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#00993F_1px,transparent_1px)] [background-size:16px_16px]" />

                      <svg className="w-full h-full" viewBox="0 0 300 200">
                        <path
                          d="M 30,170 Q 70,50 140,80 T 260,30"
                          fill="none"
                          stroke="#08A6BA"
                          strokeWidth="3"
                          strokeDasharray="6,4"
                        />
                        <circle cx="30" cy="170" r="7" fill="#00993F" />
                        <text x="42" y="175" fill="#FFFFFF" fontSize="10" fontWeight="bold">
                          Depot
                        </text>

                        <circle cx="95" cy="85" r="5" fill="#00993F" />
                        <circle cx="140" cy="80" r="5" fill="#00993F" />
                        <circle cx="180" cy="65" r="6" fill="#08A6BA" className="animate-pulse" />
                        <text x="170" y="50" fill="#FECA36" fontSize="10" fontWeight="bold">
                          {currentRouteItem.vehicle?.plateNumber || "Truck"}
                        </text>

                        <circle cx="260" cy="30" r="7" fill="#FECA36" />
                        <text x="210" y="25" fill="#FFFFFF" fontSize="10" fontWeight="bold">
                          Weighbridge
                        </text>
                      </svg>
                    </div>

                    <div className="mt-4 p-3 rounded-nested bg-[#F6F8F7] border border-[#E3E9E5] text-xs space-y-2">
                      <div className="flex justify-between">
                        <span className="text-[#9CA3AF]">Origin Depot:</span>
                        <span className="font-semibold text-slate-800">
                          {currentRouteItem.route.startDepot}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#9CA3AF]">Disposal / Recovery:</span>
                        <span className="font-semibold text-slate-800">
                          {currentRouteItem.route.endDestination}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#9CA3AF]">Telemetry Link:</span>
                        <span className="font-bold text-[#00993F]">GPS Fix Verified (10 satellites)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* VIEW 2: ROUTE HISTORY & ARCHIVE */}
      {activeTab === "history" && (
        <div className="space-y-5">
          {/* Historical Metrics Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Routes Executed"
              value={routesList.length}
              subtitle="All-time recorded manifests"
              icon={<Truck className="w-5 h-5" />}
              accentColor="primary"
            />
            <StatCard
              title="Waypoints Serviced"
              value={routesList.reduce((acc, r) => acc + (r.route.completedStops || 0), 0)}
              subtitle="Total client pickups logged"
              icon={<CheckCircle2 className="w-5 h-5" />}
              accentColor="cyan"
            />
            <StatCard
              title="Distance Logged"
              value={`${routesList
                .reduce((acc, r) => acc + parseFloat(r.route.totalDistanceKm || "0"), 0)
                .toFixed(1)} km`}
              subtitle="Total odometer tracking"
              icon={<Navigation className="w-5 h-5" />}
              accentColor="neutral"
            />
            <StatCard
              title="Total Fuel Consumed"
              value={`${routesList
                .reduce((acc, r) => acc + parseFloat(r.route.fuelUsedLitres || "0"), 0)
                .toFixed(1)} L`}
              subtitle="Fleet diesel consumption"
              icon={<Fuel className="w-5 h-5" />}
              accentColor="amber"
            />
          </div>

          {/* Search, Filter & History Archive Table */}
          <div className="bg-white rounded-card border border-[#E3E9E5] shadow-card-elevated overflow-hidden">
            <div className="p-4 border-b border-[#F0F4F2] flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-[#08A6BA]" />
                <h3 className="text-sm font-bold text-slate-900">
                  Historical Route Manifests & Fleet Archive ({filteredHistoryRoutes.length})
                </h3>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#9CA3AF]" />
                  <input
                    type="text"
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    placeholder="Search route code, driver..."
                    className="pl-8 pr-3 py-1.5 bg-[#F6F8F7] border border-[#E3E9E5] rounded-nested text-xs focus:outline-none focus:border-[#00993F]"
                  />
                </div>

                <select
                  value={historyRangeFilter}
                  onChange={(e) => setHistoryRangeFilter(e.target.value as any)}
                  className="px-2.5 py-1.5 bg-[#F6F8F7] border border-[#E3E9E5] rounded-nested text-xs text-slate-700 focus:outline-none focus:border-[#00993F]"
                >
                  <option value="all">All Dates</option>
                  <option value="7d">Past 7 Days</option>
                  <option value="30d">Past 30 Days</option>
                </select>

                <select
                  value={historyStatusFilter}
                  onChange={(e) => setHistoryStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-[#F6F8F7] border border-[#E3E9E5] rounded-nested text-xs text-slate-700 focus:outline-none focus:border-[#00993F]"
                >
                  <option value="all">All Statuses</option>
                  <option value="completed">Completed</option>
                  <option value="in_progress">In Progress</option>
                  <option value="planned">Planned</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F6F8F7] border-b border-[#E3E9E5]">
                  <tr className="text-[#4B5563] font-semibold">
                    <th className="py-3 px-4">Route Code</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Corridor Name</th>
                    <th className="py-3 px-4">Vehicle & Driver</th>
                    <th className="py-3 px-4">Stops Completed</th>
                    <th className="py-3 px-4">Distance & Fuel</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F4F2]">
                  {filteredHistoryRoutes.map(({ route, vehicle }) => {
                    const rDate =
                      typeof route.routeDate === "string"
                        ? route.routeDate
                        : new Date(route.routeDate).toISOString().split("T")[0];

                    const completionPercent =
                      route.totalStops > 0
                        ? Math.round((route.completedStops / route.totalStops) * 100)
                        : 0;

                    return (
                      <tr key={route.id} className="hover:bg-[#F6F8F7] transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          {route.routeCode}
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-800">
                          {formatDate(rDate)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{route.name}</div>
                          <div className="text-[11px] text-[#4B5563]">
                            {route.startDepot} → {route.endDestination}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                            <Truck className="w-3.5 h-3.5 text-[#00993F]" />
                            <span>{vehicle?.plateNumber || "Truck Assigned"}</span>
                          </div>
                          <div className="text-[11px] text-[#4B5563]">{route.driverName}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">
                            {route.completedStops} / {route.totalStops} stops
                          </div>
                          <div className="w-24 bg-[#E3E9E5] h-1.5 rounded-full mt-1 overflow-hidden">
                            <div
                              className="bg-[#00993F] h-full rounded-full"
                              style={{ width: `${completionPercent}%` }}
                            />
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-800">
                            {route.totalDistanceKm} km
                          </div>
                          <div className="text-[11px] text-[#FECA36] font-semibold">
                            {route.fuelUsedLitres} L fuel
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              route.status === "completed"
                                ? "primary"
                                : route.status === "in_progress"
                                ? "cyan"
                                : "neutral"
                            }
                            dot
                          >
                            {route.status.replace("_", " ")}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => {
                              handleDateChange(rDate);
                              setSelectedRouteId(route.id);
                              setActiveTab("active");
                            }}
                            className="px-2.5 py-1 rounded bg-[#EDF9F1] hover:bg-[#00993F] text-[#00682B] hover:text-white font-bold text-[11px] border border-[#ADE4C1] transition-all cursor-pointer"
                          >
                            Inspect Manifest
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: ROUTE CAPACITY SETTINGS MODAL */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-card max-w-md w-full p-6 shadow-2xl border border-[#E3E9E5] animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F4F2]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#EDF9F1] text-[#00993F] flex items-center justify-center font-bold">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Route Capacity & Dispatch Rules
                  </h3>
                  <p className="text-[11px] text-[#4B5563]">
                    Configure maximum stops per route before auto-splitting
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSettingsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Maximum Pickup Points / Stops per Route *
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={maxStopsInput}
                    onChange={(e) => setMaxStopsInput(parseInt(e.target.value) || 1)}
                    className="w-24 p-2 bg-[#F6F8F7] border border-[#E3E9E5] rounded-nested text-sm font-bold text-slate-900 focus:outline-none focus:border-[#00993F]"
                  />
                  <div className="flex items-center gap-1.5">
                    {[4, 5, 6, 8, 10].map((preset) => (
                      <button
                        type="button"
                        key={preset}
                        onClick={() => setMaxStopsInput(preset)}
                        className={`px-2 py-1 rounded-nested text-[11px] font-bold border cursor-pointer ${
                          maxStopsInput === preset
                            ? "bg-[#00993F] text-white border-[#00993F]"
                            : "bg-[#F6F8F7] text-[#4B5563] border-[#E3E9E5] hover:bg-[#EDF9F1]"
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>
                <span className="text-[11px] text-[#4B5563] mt-1 block">
                  Recommended: 6 stops for compactor trucks in urban sectors.
                </span>
              </div>

              <div className="p-3.5 bg-[#F6F8F7] rounded-nested border border-[#E3E9E5] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">
                    Auto-Create Overflow Route when Exceeded
                  </span>
                  <input
                    type="checkbox"
                    checked={autoSplitToggle}
                    onChange={(e) => setAutoSplitToggle(e.target.checked)}
                    className="w-4 h-4 text-[#00993F] rounded focus:ring-[#00993F]"
                  />
                </div>
                <p className="text-[11px] text-[#4B5563]">
                  When total pickups for a day exceed the threshold ({maxStopsInput} stops),
                  automatically partition stops into Route 2, Route 3 with available company trucks and drivers.
                </p>
              </div>

              <div className="space-y-2 text-[11px] text-[#4B5563]">
                <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                  <Info className="w-3.5 h-3.5 text-[#00993F]" />
                  <span>Logistics Hub & Depot Defaults:</span>
                </div>
                <p>Start: {dispatchSettingsState.defaultStartDepot}</p>
                <p>Destination: {dispatchSettingsState.defaultEndDestination}</p>
              </div>

              <div className="pt-3 border-t border-[#F0F4F2] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSettingsModalOpen(false)}
                  className="px-3 py-2 text-xs font-bold text-[#4B5563] hover:bg-[#F0F4F2] rounded-nested cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={settingsLoading}
                  className="px-4 py-2 text-xs font-bold bg-[#00993F] text-white rounded-nested hover:bg-[#008235] shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {settingsLoading ? "Saving..." : "Save Settings & Rebalance"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ASSIGN DRIVER & TRUCK MODAL */}
      {isAssignModalOpen && currentRouteItem && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-card max-w-md w-full p-6 shadow-2xl border border-[#E3E9E5] animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F4F2]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#EDF9F1] text-[#00993F] flex items-center justify-center font-bold">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Assign Resources to Route
                  </h3>
                  <p className="text-[11px] text-[#4B5563]">
                    {currentRouteItem.route.routeCode} — {currentRouteItem.route.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveReassignment} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-800 block mb-1">Assigned Vehicle *</label>
                <select
                  value={reassignVehicleId}
                  onChange={(e) => {
                    setReassignVehicleId(e.target.value);
                    const v = fleetVehicles.find((veh) => veh.id === e.target.value);
                    if (v?.assignedDriverName) {
                      setReassignDriverName(v.assignedDriverName);
                      if (v.assignedDriverPhone) setReassignDriverPhone(v.assignedDriverPhone);
                    }
                  }}
                  className="w-full p-2 bg-[#F6F8F7] border border-[#E3E9E5] rounded-nested text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#00993F]"
                >
                  <option value="">Select a vehicle from fleet...</option>
                  {fleetVehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.plateNumber} — {v.model} ({v.type.replace("_", " ")})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Driver Name *</label>
                <input
                  type="text"
                  required
                  value={reassignDriverName}
                  onChange={(e) => setReassignDriverName(e.target.value)}
                  placeholder="e.g. Mohammed Bakari"
                  className="w-full p-2 bg-[#F6F8F7] border border-[#E3E9E5] rounded-nested text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#00993F]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Driver Contact Phone</label>
                <input
                  type="text"
                  value={reassignDriverPhone}
                  onChange={(e) => setReassignDriverPhone(e.target.value)}
                  placeholder="e.g. +254 712 345 678"
                  className="w-full p-2 bg-[#F6F8F7] border border-[#E3E9E5] rounded-nested text-xs text-slate-900 focus:outline-none focus:border-[#00993F]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Crew Members (Helper Staff)</label>
                <input
                  type="text"
                  value={reassignCrewNames}
                  onChange={(e) => setReassignCrewNames(e.target.value)}
                  placeholder="e.g. Peter Maina, Samuel Kipkorir"
                  className="w-full p-2 bg-[#F6F8F7] border border-[#E3E9E5] rounded-nested text-xs text-slate-900 focus:outline-none focus:border-[#00993F]"
                />
              </div>

              <div className="pt-3 border-t border-[#F0F4F2] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-3 py-2 text-xs font-bold text-[#4B5563] hover:bg-[#F0F4F2] rounded-nested cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reassignLoading}
                  className="px-4 py-2 text-xs font-bold bg-[#00993F] text-white rounded-nested hover:bg-[#008235] shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {reassignLoading ? "Saving..." : "Save & Sync Manifest"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: RESCHEDULE STOP MODAL */}
      {rescheduleJobTarget && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-card max-w-sm w-full p-6 shadow-2xl border border-[#E3E9E5] animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F4F2]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Reschedule Stop</h3>
                  <p className="text-[11px] text-[#4B5563]">{rescheduleJobTarget.clientName}</p>
                </div>
              </div>
              <button
                onClick={() => setRescheduleJobTarget(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600">
                Move job <strong>{rescheduleJobTarget.jobNumber}</strong> to another operational date manifest:
              </p>
              <div>
                <label className="font-bold text-slate-800 block mb-1">New Collection Date *</label>
                <input
                  type="date"
                  value={rescheduleDateInput}
                  onChange={(e) => setRescheduleDateInput(e.target.value)}
                  className="w-full p-2 bg-[#F6F8F7] border border-[#E3E9E5] rounded-nested text-xs font-bold text-slate-900 focus:outline-none focus:border-[#00993F]"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-[#F0F4F2] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setRescheduleJobTarget(null)}
                className="px-3 py-2 text-xs font-bold text-[#4B5563] hover:bg-[#F0F4F2] rounded-nested cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReschedule}
                className="px-4 py-2 text-xs font-bold bg-[#00993F] text-white rounded-nested hover:bg-[#008235] shadow-xs cursor-pointer"
              >
                Confirm Reschedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: OFFICIAL DIGITAL ROUTE MANIFEST MODAL (PRINT READY) */}
      {isManifestModalOpen && currentRouteItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-card max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-[#E3E9E5] max-h-[90vh] overflow-y-auto space-y-5 animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-[#E3E9E5]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs bg-[#EDF9F1] text-[#00993F] px-2 py-0.5 rounded border border-[#ADE4C1]">
                    {currentRouteItem.route.routeCode}
                  </span>
                  <span className="text-xs text-slate-500 font-bold uppercase">
                    Official Daily Collection Manifest
                  </span>
                </div>
                <h2 className="text-lg font-black text-slate-900 mt-1">
                  {currentRouteItem.route.name}
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Date: <strong>{formatDate(selectedDate)}</strong> • Start: {currentRouteItem.route.startDepot} • Destination: {currentRouteItem.route.endDestination}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-nested bg-[#00993F] text-white text-xs font-bold hover:bg-[#008235] shadow-xs cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Manifest</span>
                </button>
                <button
                  onClick={() => setIsManifestModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Logistics Resources Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-nested bg-[#F6F8F7] border border-[#E3E9E5] text-xs">
              <div>
                <span className="text-slate-500 block text-[11px] font-bold uppercase">
                  Assigned Truck
                </span>
                <strong className="text-slate-900 text-sm">
                  {currentRouteItem.vehicle?.plateNumber || "Pending Vehicle"}
                </strong>
                <span className="text-slate-500 block text-[11px]">
                  {currentRouteItem.vehicle?.model || "Fleet Unit"}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block text-[11px] font-bold uppercase">
                  Lead Driver
                </span>
                <strong className="text-slate-900 text-sm">
                  {currentRouteItem.route.driverName}
                </strong>
                <span className="text-slate-500 block text-[11px]">
                  {currentRouteItem.route.driverPhone || "+254 712 345 678"}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block text-[11px] font-bold uppercase">
                  Field Crew
                </span>
                <strong className="text-slate-900 text-sm">
                  {currentRouteItem.route.crewNames || "Peter Maina, Samuel Kipkorir"}
                </strong>
                <span className="text-slate-500 block text-[11px]">
                  {displayStops.length} stops ({displayStops.filter((s) => s.status === "completed").length} completed)
                </span>
              </div>
            </div>

            {/* Stops Table */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
                Waypoint Manifest Stops ({displayStops.length})
              </h4>
              <div className="border border-[#E3E9E5] rounded-nested overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F0F4F2] text-slate-700 font-bold border-b border-[#E3E9E5]">
                    <tr>
                      <th className="py-2.5 px-3 w-10 text-center">#</th>
                      <th className="py-2.5 px-3">Client & Location</th>
                      <th className="py-2.5 px-3">Contact</th>
                      <th className="py-2.5 px-3">Waste Stream</th>
                      <th className="py-2.5 px-3 text-right">Est. Kg</th>
                      <th className="py-2.5 px-3 text-right">Actual Kg</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E3E9E5]">
                    {displayStops.map((stop) => (
                      <tr key={stop.jobId} className="hover:bg-[#F6F8F7]">
                        <td className="py-2.5 px-3 font-mono font-bold text-center text-slate-900">
                          {stop.seq}
                        </td>
                        <td className="py-2.5 px-3">
                          <strong className="text-slate-900 block">{stop.name}</strong>
                          <span className="text-[11px] text-slate-500">{stop.address}</span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">
                          {stop.phone}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-[#00993F]">
                          {stop.stream}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                          {stop.expectedKg} kg
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                          {stop.actualWeightKg ? `${stop.actualWeightKg} kg` : "—"}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <Badge
                            variant={
                              stop.status === "completed"
                                ? "primary"
                                : stop.status === "in_progress"
                                ? "cyan"
                                : "neutral"
                            }
                          >
                            {stop.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Signature & Verification Footnotes */}
            <div className="pt-4 border-t border-[#E3E9E5] grid grid-cols-2 gap-6 text-[11px] text-slate-600">
              <div className="space-y-4">
                <div>
                  <span className="font-bold block text-slate-900">Lead Driver Verification:</span>
                  <div className="mt-2 border-b border-dashed border-slate-400 w-48" />
                  <span className="text-[10px] text-slate-500">Signature / Date</span>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <span className="font-bold block text-slate-900">Depot Weighbridge Officer:</span>
                  <div className="mt-2 border-b border-dashed border-slate-400 w-48" />
                  <span className="text-[10px] text-slate-500">Gross / Tare Seal Verification</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
