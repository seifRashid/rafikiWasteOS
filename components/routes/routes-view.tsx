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
  X,
  Check,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { createRouteAction, rescheduleMissedStopAction } from "@/server/actions/routes";
import type { Route, Vehicle } from "@/server/db/schema";

interface RouteWithVehicle {
  route: Route;
  vehicle: Vehicle | null;
}

interface RoutesViewProps {
  initialRoutes: RouteWithVehicle[];
}

export function RoutesView({ initialRoutes }: RoutesViewProps) {
  const [routesList, setRoutesList] = useState<RouteWithVehicle[]>(initialRoutes);
  const [selectedRouteId, setSelectedRouteId] = useState<string>(
    initialRoutes[0]?.route.id || ""
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [rescheduleSuccess, setRescheduleSuccess] = useState<string | null>(null);

  // New Route Form
  const [routeName, setRouteName] = useState("");
  const [driverName, setDriverName] = useState("Mohammed Bakari");
  const [routeDate, setRouteDate] = useState(new Date().toISOString().split("T")[0]);

  const currentRouteItem =
    routesList.find((r) => r.route.id === selectedRouteId) || routesList[0];

  const mockStops = [
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
      address: "Spring Valley Rd",
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

  const handleCreateRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRouteItem?.vehicle?.id) return;

    try {
      const res = await createRouteAction({
        name: routeName,
        driverName,
        routeDate,
        vehicleId: currentRouteItem.vehicle.id,
      });

      if (res.success && res.data) {
        setRoutesList([
          { route: res.data as Route, vehicle: currentRouteItem.vehicle },
          ...routesList,
        ]);
        setSelectedRouteId((res.data as Route).id);
        setIsCreateModalOpen(false);
        setRouteName("");
      }
    } catch {
      alert("Failed to create route");
    }
  };

  const handleReschedule = () => {
    setRescheduleSuccess("Stop rescheduled to tomorrow's Morning Manifest!");
    setTimeout(() => setRescheduleSuccess(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E3E9E5]">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Route Management & Dispatch
          </h1>
          <p className="text-xs text-[#4B5563] mt-0.5">
            Daily collection manifests, driver & vehicle assignments, km logging and waypoint tracking.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-nested bg-[#00993F] text-white text-xs font-semibold shadow-sm hover:bg-[#008235] transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Plan Daily Route</span>
        </button>
      </div>

      {/* Routes Switcher Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {routesList.map(({ route, vehicle }) => {
          const isSelected = route.id === currentRouteItem?.route.id;
          return (
            <button
              key={route.id}
              onClick={() => setSelectedRouteId(route.id)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-nested text-xs font-semibold whitespace-nowrap transition-all border ${
                isSelected
                  ? "bg-[#00993F] text-white border-[#00993F] shadow-sm"
                  : "bg-white text-[#4B5563] border-[#E3E9E5] hover:bg-[#F0F4F2]"
              }`}
            >
              <Truck className={`w-3.5 h-3.5 ${isSelected ? "text-white" : "text-[#00993F]"}`} />
              <div className="text-left">
                <div className="font-bold">{route.name}</div>
                <div className={`text-[10px] ${isSelected ? "text-white/80" : "text-[#9CA3AF]"}`}>
                  {route.routeCode} • {route.driverName}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {rescheduleSuccess && (
        <div className="p-3 rounded-nested bg-[#EDF9F1] border border-[#ADE4C1] text-xs font-bold text-[#00682B] flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{rescheduleSuccess}</span>
        </div>
      )}

      {/* Route Telemetry Stat Cards (4 columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Stops Completion"
          value={`${currentRouteItem?.route.completedStops || 8} / ${currentRouteItem?.route.totalStops || 12}`}
          subtitle="66% of manifest completed"
          icon={<CheckCircle2 className="w-5 h-5" />}
          accentColor="primary"
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
          value={`${currentRouteItem?.route.totalDistanceKm || "42.5"} km`}
          subtitle="GPS tracked odometer"
          icon={<Navigation className="w-5 h-5" />}
          accentColor="neutral"
        />

        <StatCard
          title="Fuel Consumed"
          value={`${currentRouteItem?.route.fuelUsedLitres || "18.4"} L`}
          subtitle="2.3 km per litre average"
          icon={<Fuel className="w-5 h-5" />}
          accentColor="amber"
        />
      </div>

      {/* Route Path & Stops Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Stops Sequence Manifest */}
        <div className="lg:col-span-2 bg-white rounded-card p-5 border border-[#E3E9E5] shadow-card-elevated">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#F0F4F2]">
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#00993F]" />
                Stop Waypoint Sequence & Schedule
              </h3>
              <p className="text-xs text-[#4B5563]">
                Driver Mohammed Bakari • Crew: Peter Maina, Samuel Kipkorir
              </p>
            </div>
            <Badge variant="cyan" dot>
              Live Telematics
            </Badge>
          </div>

          <div className="space-y-3">
            {mockStops.map((stop) => (
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
                      className="text-[11px] font-bold text-[#785608] hover:underline bg-[#FFF8D6] px-2 py-1 rounded-nested border border-[#FCE38A]"
                    >
                      Reschedule
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Interactive GPS Route Visualization & Depot Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-card p-5 border border-[#E3E9E5] shadow-card-elevated">
            <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-[#F0F4F2] mb-3 flex items-center gap-2">
              <Navigation className="w-4 h-4 text-[#08A6BA]" />
              Corridor Vector Map
            </h3>

            {/* SVG Interactive Map Simulation */}
            <div className="w-full h-56 bg-[#111827] rounded-nested relative overflow-hidden flex items-center justify-center p-4">
              {/* Grid Lines */}
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#00993F_1px,transparent_1px)] [background-size:16px_16px]" />

              {/* Simulated SVG Route Path */}
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
                <text x="180" y="50" fill="#FECA36" fontSize="10" fontWeight="bold">
                  Truck KDD (En Route)
                </text>

                <circle cx="260" cy="30" r="7" fill="#FECA36" />
                <text x="210" y="25" fill="#FFFFFF" fontSize="10" fontWeight="bold">
                  Weighbridge MRF
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

      {/* Plan Route Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-card max-w-md w-full p-6 shadow-modal border border-[#E3E9E5] animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F4F2]">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#00993F]" />
                Create Daily Route Manifest
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
                  placeholder="e.g. Karen & Langata Residential Route"
                  value={routeName}
                  onChange={(e) => setRouteName(e.target.value)}
                  className="w-full p-2.5 rounded-nested border border-[#E3E9E5] focus:outline-none focus:border-[#00993F]"
                />
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
                  className="px-4 py-2 text-xs font-semibold text-[#4B5563] hover:bg-[#F0F4F2] rounded-nested"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-[#00993F] text-white rounded-nested hover:bg-[#008235]"
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
