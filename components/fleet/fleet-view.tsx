"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Truck,
  AlertTriangle,
  Wrench,
  Fuel,
  Calendar,
  Gauge,
  ShieldCheck,
  Plus,
  CheckCircle2,
  X,
  Scale,
  Package,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { formatDate } from "@/lib/utils";
import { updateVehicleTelemetryAction, logVehicleServiceAction } from "@/server/actions/fleet";
import type { Vehicle, Asset } from "@/server/db/schema";

interface FleetViewProps {
  initialVehicles: Vehicle[];
  initialAssets: Asset[];
}

export function FleetView({ initialVehicles, initialAssets }: FleetViewProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [assets, setAssets] = useState<Asset[]>(initialAssets);
  const [activeTab, setActiveTab] = useState<"vehicles" | "assets">("vehicles");

  // Service Modal State
  const [selectedVehicleForService, setSelectedVehicleForService] = useState<Vehicle | null>(null);
  const [serviceMileage, setServiceMileage] = useState("");
  const [serviceLoading, setServiceLoading] = useState(false);

  // Telemetry Modal State
  const [selectedVehicleForTelemetry, setSelectedVehicleForTelemetry] = useState<Vehicle | null>(null);
  const [newOdometer, setNewOdometer] = useState("");
  const [newFuel, setNewFuel] = useState("75");

  const operatingCount = vehicles.filter((v) => v.status === "active" || v.status === "in_transit").length;

  const handleLogService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicleForService) return;
    setServiceLoading(true);

    try {
      const km = parseInt(serviceMileage);
      const res = await logVehicleServiceAction({
        vehicleId: selectedVehicleForService.id,
        serviceMileageKm: km,
        nextServiceIntervalKm: 10000,
      });

      if (res.success && res.nextServiceKm) {
        setVehicles(
          vehicles.map((v) =>
            v.id === selectedVehicleForService.id
              ? {
                  ...v,
                  currentMileageKm: km,
                  nextServiceKm: res.nextServiceKm,
                  status: "active",
                }
              : v
          )
        );
        setSelectedVehicleForService(null);
      }
    } catch {
      alert("Failed to log maintenance");
    } finally {
      setServiceLoading(false);
    }
  };

  const handleUpdateTelemetry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicleForTelemetry) return;

    try {
      const km = parseInt(newOdometer);
      const fuel = parseInt(newFuel);
      const res = await updateVehicleTelemetryAction({
        vehicleId: selectedVehicleForTelemetry.id,
        currentMileageKm: km,
        fuelLevelPercent: fuel,
      });

      if (res.success) {
        setVehicles(
          vehicles.map((v) =>
            v.id === selectedVehicleForTelemetry.id
              ? { ...v, currentMileageKm: km, fuelLevelPercent: fuel }
              : v
          )
        );
        setSelectedVehicleForTelemetry(null);
      }
    } catch {
      alert("Failed to update telemetry");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E3E9E5]">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Vehicle & Asset Management
          </h1>
          <p className="text-xs text-[#4B5563] mt-0.5">
            Fleet telemetry, predictive service alerts, fuel logs, and physical bin/compactor equipment.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="cyan" dot>
            {operatingCount} of {vehicles.length} Trucks On Route
          </Badge>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Fleet"
          value={`${operatingCount} / ${vehicles.length}`}
          subtitle="Compactors, flatbeds & tuk-tuks"
          icon={<Truck className="w-5 h-5" />}
          accentColor="primary"
        />

        <StatCard
          title="Service Alerts"
          value="1 Vehicle"
          subtitle="Inspection due in 350 km"
          icon={<AlertTriangle className="w-5 h-5" />}
          accentColor="amber"
          trend={{ value: "Action Required", isPositive: false }}
        />

        <StatCard
          title="Container Assets"
          value="182 Bins"
          subtitle="Wheeled 240L & 1100L skips"
          icon={<Package className="w-5 h-5" />}
          accentColor="neutral"
        />

        <StatCard
          title="Equipment Readiness"
          value="100%"
          subtitle="Weighbridges & Balers Active"
          icon={<ShieldCheck className="w-5 h-5" />}
          accentColor="cyan"
        />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E3E9E5] pb-2">
        <button
          onClick={() => setActiveTab("vehicles")}
          className={`flex items-center gap-2 px-4 py-2 rounded-nested text-xs font-bold transition-all ${
            activeTab === "vehicles"
              ? "bg-[#00993F] text-white shadow-sm"
              : "text-[#4B5563] hover:bg-[#F0F4F2]"
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Fleet Telemetry & Vehicles ({vehicles.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("assets")}
          className={`flex items-center gap-2 px-4 py-2 rounded-nested text-xs font-bold transition-all ${
            activeTab === "assets"
              ? "bg-[#00993F] text-white shadow-sm"
              : "text-[#4B5563] hover:bg-[#F0F4F2]"
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Bins & Heavy Machinery ({assets.length || 3})</span>
        </button>
      </div>

      {/* Vehicles Cards Grid */}
      {activeTab === "vehicles" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {vehicles.map((v) => {
            const kmToService = v.nextServiceKm - v.currentMileageKm;
            const isServiceDue = kmToService <= 500 && kmToService > 0;

            return (
              <div
                key={v.id}
                className={`bg-white rounded-card p-6 border shadow-card-hoverable flex flex-col justify-between transition-all ${
                  isServiceDue
                    ? "border-[#FCE38A] ring-1 ring-[#FECA36]"
                    : "border-[#E3E9E5]"
                }`}
              >
                <div>
                  {/* Top: Plate & Model */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-base font-extrabold text-slate-900">
                          {v.plateNumber}
                        </span>
                        <Badge
                          variant={
                            v.status === "active" || v.status === "in_transit"
                              ? "primary"
                              : v.status === "maintenance"
                              ? "danger"
                              : "neutral"
                          }
                          dot
                        >
                          {v.status.replace("_", " ")}
                        </Badge>
                      </div>
                      <h4 className="text-xs font-semibold text-[#4B5563] mt-0.5">
                        {v.model}
                      </h4>
                    </div>

                    <span className="text-[10px] font-bold text-[#00993F] bg-[#EDF9F1] px-2.5 py-1 rounded-full border border-[#ADE4C1] uppercase">
                      {v.type.replace("_", " ")}
                    </span>
                  </div>

                  {/* Image render representation */}
                  <div className="relative h-28 w-full rounded-nested overflow-hidden mb-4 border border-[#E3E9E5] bg-[#F6F8F7]">
                    <Image
                      src="/truck.jpg"
                      alt={v.plateNumber}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-2 left-3 text-white text-[11px] font-bold">
                      Capacity: {parseFloat(v.capacityKg).toLocaleString()} kg Payload
                    </div>
                  </div>

                  {/* Predictive Service Alert Pill */}
                  {isServiceDue && (
                    <div className="mb-4 p-3 rounded-nested bg-[#FFF8D6] border border-[#FCE38A] flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-[#785608] shrink-0" />
                        <span className="font-bold text-[#785608]">
                          Service due in {kmToService} km!
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedVehicleForService(v);
                          setServiceMileage(v.currentMileageKm.toString());
                        }}
                        className="px-2.5 py-1 bg-[#FECA36] text-[#785608] rounded-nested font-bold text-[11px] hover:bg-[#E5B01E]"
                      >
                        Log Service
                      </button>
                    </div>
                  )}

                  {/* Telemetry Metrics */}
                  <div className="grid grid-cols-3 gap-3 p-3 rounded-nested bg-[#F6F8F7] border border-[#E3E9E5] text-xs text-center">
                    <div>
                      <span className="text-[10px] text-[#9CA3AF] block font-medium">Odometer</span>
                      <span className="font-mono font-bold text-slate-800">
                        {v.currentMileageKm.toLocaleString()} km
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-[#9CA3AF] block font-medium">Fuel Level</span>
                      <span className="font-mono font-bold text-[#00993F]">
                        {v.fuelLevelPercent}%
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-[#9CA3AF] block font-medium">Next Service</span>
                      <span className="font-mono font-bold text-slate-800">
                        {v.nextServiceKm.toLocaleString()} km
                      </span>
                    </div>
                  </div>

                  {/* Driver & Depot Details */}
                  <div className="mt-3 space-y-1 text-xs text-[#4B5563]">
                    <div className="flex justify-between">
                      <span className="text-[#9CA3AF]">Assigned Driver:</span>
                      <span className="font-semibold text-slate-800">{v.assignedDriverName || "Mohammed Bakari"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#9CA3AF]">Operating Depot:</span>
                      <span className="font-semibold text-slate-800">{v.depotLocation}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#9CA3AF]">Inspection Expiry:</span>
                      <span className="font-medium text-slate-800">{formatDate(v.inspectionExpiryDate)}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Quick Telemetry Button */}
                <div className="mt-5 pt-3 border-t border-[#F0F4F2] flex items-center justify-between">
                  <span className="text-[11px] text-[#9CA3AF]">
                    GPS Live Ping • 2 mins ago
                  </span>
                  <button
                    onClick={() => {
                      setSelectedVehicleForTelemetry(v);
                      setNewOdometer(v.currentMileageKm.toString());
                      setNewFuel((v.fuelLevelPercent || 75).toString());
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-nested bg-[#F0F4F2] hover:bg-[#E3E9E5] text-xs font-bold text-[#111827] transition-all"
                  >
                    <Gauge className="w-3.5 h-3.5 text-[#00993F]" />
                    <span>Update Odometer</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Assets Tab (Bins, Weighbridges) */}
      {activeTab === "assets" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white rounded-card p-5 border border-[#E3E9E5] shadow-card-hoverable">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-xs font-bold text-[#00993F] bg-[#EDF9F1] px-2 py-0.5 rounded-full">
                SCL-01-WB
              </span>
              <Badge variant="primary" dot>
                Calibrated
              </Badge>
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Avery Berkel 60t Weighbridge</h4>
            <p className="text-xs text-[#4B5563] mt-1">
              Central Industrial Area MRF Depot • Certified by Kenya Bureau of Standards (KEBS).
            </p>
            <div className="mt-4 pt-3 border-t border-[#F0F4F2] text-xs flex justify-between">
              <span className="text-[#9CA3AF]">Capacity: 60,000 kg</span>
              <span className="font-bold text-[#00993F]">IP Connected</span>
            </div>
          </div>

          <div className="bg-white rounded-card p-5 border border-[#E3E9E5] shadow-card-hoverable">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-xs font-bold text-[#08A6BA] bg-[#EEFBFD] px-2 py-0.5 rounded-full">
                BAL-B20-04
              </span>
              <Badge variant="primary" dot>
                Operational
              </Badge>
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Bramidan B20 Vertical Baler</h4>
            <p className="text-xs text-[#4B5563] mt-1">
              Baling press producing 220kg - 250kg high-density PET and Cardboard bales.
            </p>
            <div className="mt-4 pt-3 border-t border-[#F0F4F2] text-xs flex justify-between">
              <span className="text-[#9CA3AF]">Bay 01 Sorting</span>
              <span className="font-bold text-[#08A6BA]">35 Bales / Shift</span>
            </div>
          </div>

          <div className="bg-white rounded-card p-5 border border-[#E3E9E5] shadow-card-hoverable">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-xs font-bold text-slate-800 bg-[#F0F4F2] px-2 py-0.5 rounded-full">
                BIN-LOT-2026
              </span>
              <Badge variant="neutral">Assigned</Badge>
            </div>
            <h4 className="font-bold text-slate-900 text-sm">182 x Heavy-Duty Wheeled Bins</h4>
            <p className="text-xs text-[#4B5563] mt-1">
              Color-coded 240L & 1100L bins deployed across Safari Hotel, Kilimani, and Schools.
            </p>
            <div className="mt-4 pt-3 border-t border-[#F0F4F2] text-xs flex justify-between">
              <span className="text-[#9CA3AF]">Condition: Good</span>
              <span className="font-bold text-slate-800">RFID Tagged</span>
            </div>
          </div>
        </div>
      )}

      {/* Log Service Modal */}
      {selectedVehicleForService && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-card max-w-md w-full p-6 shadow-modal border border-[#E3E9E5] animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F4F2]">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Wrench className="w-4 h-4 text-[#00993F]" />
                Record Vehicle Service Inspection
              </h3>
              <button
                onClick={() => setSelectedVehicleForService(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-3 p-3 rounded-nested bg-[#F6F8F7] border border-[#E3E9E5] text-xs">
              <span className="text-[#9CA3AF] block font-medium">Vehicle:</span>
              <span className="font-mono font-bold text-slate-900">
                {selectedVehicleForService.plateNumber} ({selectedVehicleForService.model})
              </span>
            </div>

            <form onSubmit={handleLogService} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-[#4B5563] block mb-1">
                  Service Completed at Odometer (km) *
                </label>
                <input
                  type="number"
                  required
                  value={serviceMileage}
                  onChange={(e) => setServiceMileage(e.target.value)}
                  className="w-full p-2.5 rounded-nested border border-[#E3E9E5] font-mono focus:outline-none focus:border-[#00993F]"
                />
              </div>

              <div className="p-3 rounded-nested bg-[#EDF9F1] border border-[#ADE4C1]">
                <p className="text-[11px] text-[#00682B]">
                  Next scheduled maintenance will automatically be scheduled for{" "}
                  <strong>{parseInt(serviceMileage || "0") + 10000} km</strong> (+10,000 km standard interval).
                </p>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#F0F4F2]">
                <button
                  type="button"
                  onClick={() => setSelectedVehicleForService(null)}
                  className="px-4 py-2 text-xs font-semibold text-[#4B5563] hover:bg-[#F0F4F2] rounded-nested"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={serviceLoading}
                  className="px-4 py-2 text-xs font-semibold bg-[#00993F] text-white rounded-nested hover:bg-[#008235] transition-colors disabled:opacity-50"
                >
                  {serviceLoading ? "Saving..." : "Log & Clear Alert"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Telemetry Modal */}
      {selectedVehicleForTelemetry && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-card max-w-md w-full p-6 shadow-modal border border-[#E3E9E5] animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F4F2]">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Gauge className="w-4 h-4 text-[#08A6BA]" />
                Update Telemetry Odometer
              </h3>
              <button
                onClick={() => setSelectedVehicleForTelemetry(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateTelemetry} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-[#4B5563] block mb-1">
                  Current Odometer (km) *
                </label>
                <input
                  type="number"
                  required
                  value={newOdometer}
                  onChange={(e) => setNewOdometer(e.target.value)}
                  className="w-full p-2.5 rounded-nested border border-[#E3E9E5] font-mono focus:outline-none focus:border-[#00993F]"
                />
              </div>

              <div>
                <label className="font-bold text-[#4B5563] block mb-1">
                  Current Fuel Level (%) *
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={newFuel}
                  onChange={(e) => setNewFuel(e.target.value)}
                  className="w-full p-2.5 rounded-nested border border-[#E3E9E5] font-mono focus:outline-none focus:border-[#00993F]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#F0F4F2]">
                <button
                  type="button"
                  onClick={() => setSelectedVehicleForTelemetry(null)}
                  className="px-4 py-2 text-xs font-semibold text-[#4B5563] hover:bg-[#F0F4F2] rounded-nested"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-[#08A6BA] text-white rounded-nested hover:bg-[#068A9B]"
                >
                  Save Telemetry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
