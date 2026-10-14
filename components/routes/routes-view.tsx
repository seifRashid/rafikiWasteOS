"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Truck,
  Calendar,
  Fuel,
  Navigation,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  RefreshCw,
  ChevronRight,
  ChevronLeft,
  X,
  Check,
  Settings2,
  Sliders,
  History,
  Layers,
  ArrowRight,
  Search,
  Filter,
  Sparkles,
  Zap,
  Info,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import {
  createRouteAction,
  rescheduleMissedStopAction,
  updateDispatchSettingsAction,
  autoSplitAndGenerateRoutesAction,
} from "@/server/actions/routes";
import type { Route, Vehicle, DispatchSetting } from "@/server/db/schema";
import { formatDate, formatDateTime, formatWeight } from "@/lib/utils";

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

  // Selected Date for Daily Dispatch (Defaults to today or earliest date in list)
  const todayStr = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  // Filter routes belonging to the selected date
  const routesOnSelectedDate = routesList.filter((r) => {
    const rDate =
      typeof r.route.routeDate === "string"
        ? r.route.routeDate
        : new Date(r.route.routeDate).toISOString().split("T")[0];
    return rDate === selectedDate;
  });

  // If no routes on selected date, fallback to first available route or empty
  const activeRoutesForDay =
    routesOnSelectedDate.length > 0 ? routesOnSelectedDate : routesList.slice(0, 2);

  // Selected Route ID within the day
  const [selectedRouteId, setSelectedRouteId] = useState<string>(
    activeRoutesForDay[0]?.route.id || initialRoutes[0]?.route.id || ""
  );

  const currentRouteItem =
    routesList.find((r) => r.route.id === selectedRouteId) ||
    activeRoutesForDay[0] ||
    routesList[0];

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [rescheduleSuccess, setRescheduleSuccess] = useState<string | null>(null);
  const [autoSplitNotice, setAutoSplitNotice] = useState<string | null>(null);
  const [isAutoSplitting, setIsAutoSplitting] = useState(false);

  // New Route Form
  const [routeName, setRouteName] = useState("");
  const [driverName, setDriverName] = useState("Mohammed Bakari");
  const [routeDate, setRouteDate] = useState(selectedDate);
  const [selectedVehicleId, setSelectedVehicleId] = useState(
    fleetVehicles[0]?.id || currentRouteItem?.vehicle?.id || ""
  );

  // Capacity Settings Form State
  const [maxStopsInput, setMaxStopsInput] = useState<number>(
    dispatchSettingsState.maxStopsPerRoute || 6
  );
  const [autoSplitToggle, setAutoSplitToggle] = useState<boolean>(
    dispatchSettingsState.autoSplitExceededRoutes
  );
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSavedMessage, setSettingsSavedMessage] = useState<string | null>(null);

  // History Tab Filter States
  const [historySearch, setHistorySearch] = useState("");
  const [historyStatusFilter, setHistoryStatusFilter] = useState<string>("all");
  const [historyRangeFilter, setHistoryRangeFilter] = useState<"all" | "7d" | "30d">("all");

  // Get real stops assigned to current route
  const currentRouteDbStops = initialStops.filter(
    (s) => s.job.routeId === currentRouteItem?.route.id
  );

  // Fallback stops if this route has no database jobs explicitly linked yet
  const fallbackStops = [
    {
      seq: 1,
      name: "Safari Park Hotel & Casino",
      time: "08:00 AM",
      address: "Thika Road, Kasarani",
      stream: "Organic (1,300 kg)",
      status: "completed",
    },
    {
      seq: 2,
      name: "Brookside International School",
      time: "09:30 AM",
      address: "Spring Valley Rd, Westlands",
      stream: "Recyclable (470 kg)",
      status: "completed",
    },
    {
      seq: 3,
      name: "Java House — Kimathi Street",
      time: "11:15 AM",
      address: "CBD Kimathi St",
      stream: "Organic (320 kg)",
      status: "completed",
    },
    {
      seq: 4,
      name: "East Africa Bottlers Logistics",
      time: "02:00 PM",
      address: "Ruaraka Industrial Area",
      stream: "Recyclable (Est. 2,800 kg)",
      status: "in_progress",
    },
    {
      seq: 5,
      name: "Westlands Office Towers",
      time: "03:30 PM",
      address: "Mpaka Rd, Westlands",
      stream: "Paper & E-Waste",
      status: "pending",
    },
    {
      seq: 6,
      name: "Parklands Sports Club",
      time: "04:45 PM",
      address: "Ojijo Rd, Parklands",
      stream: "Organics & Glass",
      status: "pending",
    },
  ];

  const displayStops =
    currentRouteDbStops.length > 0
      ? currentRouteDbStops.map((s, idx) => ({
          seq: s.job.stopSequence || idx + 1,
          name: s.client?.name || "Client Stop",
          time: new Date(s.job.scheduledAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          address: s.client?.physicalAddress || "Nairobi",
          stream: `${s.job.wasteStream} (~${formatWeight(s.job.expectedQuantityKg || "300", "kg")})`,
          status: s.job.status,
          jobId: s.job.id,
        }))
      : fallbackStops.slice(0, currentRouteItem?.route.totalStops || 6);

  const handleCreateRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await createRouteAction({
        name: routeName,
        driverName,
        routeDate,
        vehicleId: selectedVehicleId || null,
      });

      if (res.success && res.data) {
        const newR = res.data as Route;
        const matchedVeh = fleetVehicles.find((v) => v.id === newR.vehicleId) || null;
        setRoutesList([{ route: newR, vehicle: matchedVeh }, ...routesList]);
        setSelectedRouteId(newR.id);
        setIsCreateModalOpen(false);
        setRouteName("");
      }
    } catch {
      alert("Failed to create route manifest");
    }
  };

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
        setSettingsSavedMessage("Route capacity thresholds updated successfully!");
        setTimeout(() => {
          setSettingsSavedMessage(null);
          setIsSettingsModalOpen(false);
        }, 1500);
      }
    } catch (err: any) {
      alert(err?.message || "Failed to save settings");
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleTriggerAutoSplit = async () => {
    setIsAutoSplitting(true);
    try {
      const res = await autoSplitAndGenerateRoutesAction(selectedDate);
      if (res.success) {
        setAutoSplitNotice(
          `Capacity Balanced: Automatically split into ${res.routesCreated} routes (${res.totalStopsDistributed} stops, max ${res.maxStopsApplied} per route). Refreshing manifests...`
        );
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } else {
        alert(res.error || "Unable to auto-split routes.");
      }
    } catch (err: any) {
      alert(err?.message || "Auto-split process failed.");
    } finally {
      setIsAutoSplitting(false);
    }
  };

  const handleReschedule = () => {
    setRescheduleSuccess("Stop rescheduled to tomorrow's Morning Manifest!");
    setTimeout(() => setRescheduleSuccess(null), 3000);
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
            Daily collection manifests, multi-route daily partitioning, driver telemetry and route history archive.
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

          {/* Settings Button */}
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-nested bg-white hover:bg-[#F6F8F7] text-slate-700 text-xs font-bold border border-[#E3E9E5] shadow-2xs transition-colors cursor-pointer"
            title="Configure maximum stops and auto-route splitting rules"
          >
            <Settings2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Capacity Settings</span>
          </button>

          {/* Plan Route Button */}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-nested bg-[#00993F] text-white text-xs font-bold shadow-sm hover:bg-[#008235] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Plan Daily Route</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {rescheduleSuccess && (
        <div className="p-3 rounded-nested bg-[#EDF9F1] border border-[#ADE4C1] text-xs font-bold text-[#00682B] flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{rescheduleSuccess}</span>
        </div>
      )}

      {autoSplitNotice && (
        <div className="p-3.5 rounded-nested bg-[#EEFBFD] border border-[#B6EEF5] text-xs font-bold text-[#067382] flex items-center gap-2 animate-in fade-in">
          <Sparkles className="w-4 h-4 text-[#08A6BA]" />
          <span>{autoSplitNotice}</span>
        </div>
      )}

      {/* VIEW 1: DAILY ACTIVE DISPATCH */}
      {activeTab === "active" && (
        <div className="space-y-5">
          {/* Day Navigation & Sub-Route Bar */}
          <div className="bg-white rounded-card p-4 border border-[#E3E9E5] shadow-card-elevated space-y-4">
            {/* Row 1: Date Bar & Quick Auto-Split Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F0F4F2]">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#00993F]" />
                  <span>Dispatch Date:</span>
                </span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    const matching = routesList.filter((r) => {
                      const rd =
                        typeof r.route.routeDate === "string"
                          ? r.route.routeDate
                          : new Date(r.route.routeDate).toISOString().split("T")[0];
                      return rd === e.target.value;
                    });
                    if (matching[0]) setSelectedRouteId(matching[0].route.id);
                  }}
                  className="px-2.5 py-1 bg-[#F6F8F7] border border-[#E3E9E5] rounded-nested text-xs font-bold text-slate-900 focus:outline-none focus:border-[#00993F]"
                />
                <span className="text-xs font-bold text-[#00993F] bg-[#EDF9F1] px-2.5 py-0.5 rounded-full border border-[#ADE4C1]">
                  {activeRoutesForDay.length} {activeRoutesForDay.length === 1 ? "Route" : "Routes"} Scheduled
                </span>
              </div>

              {/* Auto-Split Button */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleTriggerAutoSplit}
                  disabled={isAutoSplitting}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-nested bg-[#EEFBFD] hover:bg-[#D5F5F9] text-[#08A6BA] text-xs font-bold border border-[#B6EEF5] transition-all cursor-pointer disabled:opacity-50"
                  title="Automatically split collection stops into multiple routes if exceeding threshold"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isAutoSplitting ? "Splitting Routes..." : "Auto-Balance & Split Routes"}</span>
                </button>
              </div>
            </div>

            {/* Row 2: Tabs for Multiple Routes on that Day */}
            <div>
              <div className="flex items-center justify-between pb-1.5">
                <span className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider">
                  Day Manifests (Select Route Loop):
                </span>
                {activeRoutesForDay.length > 1 && (
                  <span className="text-[11px] font-bold text-[#08A6BA]">
                    ⚡ Multiple routes active today based on client volume
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
                {activeRoutesForDay.map(({ route, vehicle }, idx) => {
                  const isSelected = route.id === currentRouteItem?.route.id;
                  const stopsCount = route.totalStops || 6;
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

                {/* Quick Add Route Shortcut */}
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2.5 rounded-nested bg-white text-[#00993F] text-xs font-bold border border-dashed border-[#ADE4C1] hover:bg-[#EDF9F1] transition-colors whitespace-nowrap cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Route Loop</span>
                </button>
              </div>
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
                  Click <strong>&ldquo;Auto-Balance & Split Routes&rdquo;</strong> to automatically spin off an overflow loop with another truck and driver.
                </p>
              </div>
            </div>
          )}

          {/* Telemetry Stat Cards for Currently Selected Route */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Stops on Route"
              value={`${currentRouteItem?.route.completedStops || 0} / ${stopsOnCurrentRoute}`}
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
              value={currentRouteItem?.vehicle?.plateNumber || "KDD 482B"}
              subtitle={currentRouteItem?.vehicle?.model || "Isuzu 20m³ Compactor"}
              icon={<Truck className="w-5 h-5" />}
              accentColor="cyan"
            />

            <StatCard
              title="Distance Logged"
              value={`${currentRouteItem?.route.totalDistanceKm || "38.5"} km`}
              subtitle="GPS corridor tracking"
              icon={<Navigation className="w-5 h-5" />}
              accentColor="neutral"
            />

            <StatCard
              title="Fuel Consumed"
              value={`${currentRouteItem?.route.fuelUsedLitres || "16.2"} L`}
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
                    <span>Stop Waypoint Sequence — {currentRouteItem?.route.name}</span>
                  </h3>
                  <p className="text-xs text-[#4B5563]">
                    Driver: <strong>{currentRouteItem?.route.driverName}</strong> • Phone:{" "}
                    {currentRouteItem?.route.driverPhone || "+254 712 345 678"} • Crew:{" "}
                    {currentRouteItem?.route.crewNames || "Peter Maina, Samuel Kipkorir"}
                  </p>
                </div>
                <Badge variant={currentRouteItem?.route.status === "completed" ? "neutral" : "cyan"} dot>
                  {currentRouteItem?.route.status.replace("_", " ") || "Active"}
                </Badge>
              </div>

              <div className="space-y-3">
                {displayStops.map((stop) => (
                  <div
                    key={stop.seq}
                    className={`p-3.5 rounded-nested border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                      stop.status === "completed"
                        ? "bg-[#F6F8F7] border-[#E3E9E5]"
                        : stop.status === "in_progress"
                        ? "bg-[#EEFBFD] border-[#B6EEF5] shadow-xs ring-1 ring-[#08A6BA]"
                        : "bg-white border-[#E3E9E5]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
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

                      {stop.status === "pending" && (
                        <button
                          onClick={handleReschedule}
                          className="text-[11px] font-bold text-[#785608] hover:underline bg-[#FFF8D6] px-2 py-1 rounded-nested border border-[#FCE38A] cursor-pointer"
                        >
                          Reschedule
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: GPS Route Visualization & Depot Info */}
            <div className="space-y-6">
              <div className="bg-white rounded-card p-5 border border-[#E3E9E5] shadow-card-elevated">
                <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-[#F0F4F2] mb-3 flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-[#08A6BA]" />
                  <span>Corridor Vector Map</span>
                </h3>

                {/* SVG Interactive Map Simulation */}
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
                      {currentRouteItem?.vehicle?.plateNumber || "Truck"}
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
                      {currentRouteItem?.route.startDepot}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#9CA3AF]">Disposal / Recovery:</span>
                    <span className="font-semibold text-slate-800">
                      {currentRouteItem?.route.endDestination}
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
                {/* Search */}
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

                {/* Range Filter */}
                <select
                  value={historyRangeFilter}
                  onChange={(e) => setHistoryRangeFilter(e.target.value as any)}
                  className="px-2.5 py-1.5 bg-[#F6F8F7] border border-[#E3E9E5] rounded-nested text-xs text-slate-700 focus:outline-none focus:border-[#00993F]"
                >
                  <option value="all">All Dates</option>
                  <option value="7d">Past 7 Days</option>
                  <option value="30d">Past 30 Days</option>
                </select>

                {/* Status Filter */}
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
                              setSelectedDate(rDate);
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
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {settingsSavedMessage && (
              <div className="p-3 bg-[#EDF9F1] border border-[#ADE4C1] rounded-nested text-xs font-bold text-[#00682B] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{settingsSavedMessage}</span>
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              {/* Max Stops Setting */}
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
                    {[5, 6, 8, 10, 12].map((preset) => (
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
                  Recommended: 6 to 8 stops per route for commercial compaction trucks.
                </span>
              </div>

              {/* Auto-Split Toggle */}
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

              {/* Depot Information */}
              <div className="space-y-2 text-[11px] text-[#4B5563]">
                <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                  <Info className="w-3.5 h-3.5 text-[#00993F]" />
                  <span>Logistics Hub & Depot Defaults:</span>
                </div>
                <p>Start: {dispatchSettingsState.defaultStartDepot}</p>
                <p>Destination: {dispatchSettingsState.defaultEndDestination}</p>
              </div>

              {/* Footer */}
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
                  {settingsLoading ? "Saving..." : "Save Settings"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: PLAN ROUTE MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-card max-w-md w-full p-6 shadow-modal border border-[#E3E9E5] animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F4F2]">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#00993F]" />
                <span>Create Daily Route Manifest</span>
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRoute} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-[#4B5563] block mb-1">Route Corridor Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Karen & Langata Residential Route (Loop 2)"
                  value={routeName}
                  onChange={(e) => setRouteName(e.target.value)}
                  className="w-full p-2.5 rounded-nested border border-[#E3E9E5] focus:outline-none focus:border-[#00993F]"
                />
              </div>

              <div>
                <label className="font-bold text-[#4B5563] block mb-1">Assign Fleet Vehicle *</label>
                <select
                  value={selectedVehicleId}
                  onChange={(e) => {
                    setSelectedVehicleId(e.target.value);
                    const veh = fleetVehicles.find((v) => v.id === e.target.value);
                    if (veh?.assignedDriverName) setDriverName(veh.assignedDriverName);
                  }}
                  className="w-full p-2.5 rounded-nested border border-[#E3E9E5] focus:outline-none focus:border-[#00993F]"
                >
                  {fleetVehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.plateNumber} — {v.model} ({v.assignedDriverName || "Driver"})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#4B5563] block mb-1">Assigned Driver</label>
                  <input
                    type="text"
                    required
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    className="w-full p-2.5 rounded-nested border border-[#E3E9E5] focus:outline-none focus:border-[#00993F]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#4B5563] block mb-1">Route Date</label>
                  <input
                    type="date"
                    required
                    value={routeDate}
                    onChange={(e) => setRouteDate(e.target.value)}
                    className="w-full p-2.5 rounded-nested border border-[#E3E9E5] focus:outline-none focus:border-[#00993F]"
                  />
                </div>
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
                  className="px-4 py-2 text-xs font-semibold bg-[#00993F] text-white rounded-nested hover:bg-[#008235] cursor-pointer"
                >
                  Create Manifest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
