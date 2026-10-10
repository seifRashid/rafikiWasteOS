"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Truck,
  User,
  MapPin,
  Calendar,
  Clock,
  Layers,
  Scale,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  Route as RouteIcon,
} from "lucide-react";
import { assignJobTruckAction } from "@/server/actions/collections";
import { formatDate, formatDateTime, formatWeight } from "@/lib/utils";

export interface VehicleOption {
  id: string;
  plateNumber: string;
  model: string;
  type: string;
  capacityKg: string | number;
  assignedDriverName?: string | null;
  status: string;
}

export interface RouteOption {
  id: string;
  routeCode: string;
  name: string;
  driverName?: string;
}

export interface JobToAssign {
  id: string;
  jobNumber: string;
  clientName: string;
  physicalAddress: string;
  scheduledAt: string | Date;
  wasteStream: string;
  expectedQuantityKg: string | number;
  notes?: string | null;
  status: string;
  vehicleId?: string | null;
  vehiclePlate?: string | null;
  driverName?: string | null;
  routeId?: string | null;
}

interface AssignTruckModalProps {
  job: JobToAssign;
  availableVehicles: VehicleOption[];
  availableRoutes: RouteOption[];
}

export function AssignTruckModal({
  job,
  availableVehicles,
  availableRoutes,
}: AssignTruckModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  // Initial form values
  const defaultVehicleId = job.vehicleId || (availableVehicles[0]?.id || "");
  const defaultVehicle = availableVehicles.find((v) => v.id === defaultVehicleId);
  const defaultDriver = job.driverName || defaultVehicle?.assignedDriverName || "Mwangi Kimani";

  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(defaultVehicleId);
  const [driverName, setDriverName] = useState<string>(defaultDriver);
  const [selectedRouteId, setSelectedRouteId] = useState<string>(job.routeId || "");
  const [dispatchNotes, setDispatchNotes] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [assignedVehiclePlate, setAssignedVehiclePlate] = useState<string | null>(
    job.vehiclePlate || null
  );
  const [assignedDriver, setAssignedDriver] = useState<string | null>(job.driverName || null);

  const handleOpen = () => {
    setError(null);
    setSuccess(false);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    if (success) {
      router.refresh();
    }
  };

  const handleVehicleChange = (vehicleId: string) => {
    setSelectedVehicleId(vehicleId);
    const vehicle = availableVehicles.find((v) => v.id === vehicleId);
    if (vehicle?.assignedDriverName) {
      setDriverName(vehicle.assignedDriverName);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await assignJobTruckAction({
        jobId: job.id,
        vehicleId: selectedVehicleId || null,
        driverName: driverName.trim(),
        routeId: selectedRouteId || null,
        dispatchNotes: dispatchNotes.trim() || undefined,
      });

      if (res.success) {
        setSuccess(true);
        const matchedVeh = availableVehicles.find((v) => v.id === selectedVehicleId);
        setAssignedVehiclePlate(matchedVeh?.plateNumber || "Truck Assigned");
        setAssignedDriver(driverName.trim());
        setTimeout(() => {
          setIsOpen(false);
          router.refresh();
        }, 1200);
      } else {
        setError(res.error || "Failed to assign vehicle.");
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred during dispatch.");
    } finally {
      setLoading(false);
    }
  };

  const isAssigned = (job.status === "assigned" || assignedVehiclePlate) && (assignedVehiclePlate || assignedDriver);

  return (
    <>
      {isAssigned ? (
        <div className="flex items-center justify-end gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#EDF9F1] border border-[#ADE4C1] text-[#00682B] text-[11px] font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>
              {assignedVehiclePlate || "Truck"} ({assignedDriver || "Driver"})
            </span>
          </div>
          <button
            onClick={handleOpen}
            className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 underline cursor-pointer"
          >
            Reassign
          </button>
        </div>
      ) : (
        <button
          onClick={handleOpen}
          className="flex items-center gap-1.5 px-3 py-1 rounded-nested bg-[#EDF9F1] hover:bg-[#00993F] text-[#00682B] hover:text-white font-bold text-[11px] border border-[#ADE4C1] transition-all cursor-pointer shadow-2xs hover:shadow-sm"
        >
          <Truck className="w-3.5 h-3.5" />
          <span>Assign Truck</span>
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-card max-w-lg w-full p-6 border border-[#E3E9E5] shadow-2xl space-y-4 animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F4F2]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#EDF9F1] text-[#00993F] flex items-center justify-center font-bold">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Dispatch Collection Vehicle
                  </h3>
                  <p className="text-[11px] text-[#4B5563]">
                    Assign truck & driver manifest for {job.jobNumber}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-1 rounded-lg hover:bg-slate-100 text-[#9CA3AF] hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {success ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#EDF9F1] text-[#00993F] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="text-base font-extrabold text-slate-900">
                  Vehicle Successfully Dispatched!
                </h4>
                <p className="text-xs text-[#4B5563] max-w-xs mx-auto">
                  Job <strong className="font-mono text-slate-900">{job.jobNumber}</strong> has been
                  assigned to driver <strong>{driverName}</strong> and pushed to the collection run
                  sheet.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                {/* Job Summary Recap Box */}
                <div className="p-3.5 bg-[#F6F8F7] rounded-nested border border-[#E3E9E5] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{job.clientName}</span>
                    <span className="font-mono font-bold text-[#00993F] bg-[#EDF9F1] px-2 py-0.5 rounded border border-[#ADE4C1] text-[10px]">
                      {job.jobNumber}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-[#4B5563]">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#9CA3AF] shrink-0" />
                      <span className="truncate">{job.physicalAddress}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#9CA3AF] shrink-0" />
                      <span>{formatDateTime(job.scheduledAt)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-[#9CA3AF] shrink-0" />
                      <span className="capitalize font-semibold text-slate-800">
                        {job.wasteStream} stream
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5 text-[#9CA3AF] shrink-0" />
                      <span className="font-mono font-bold text-[#00993F]">
                        ~{formatWeight(job.expectedQuantityKg, "kg")}
                      </span>
                    </div>
                  </div>

                  {job.notes && (
                    <div className="pt-2 border-t border-[#E3E9E5] text-[11px] text-[#4B5563] italic">
                      Client Note: &ldquo;{job.notes.replace("[On-Demand Request]", "").trim()}&rdquo;
                    </div>
                  )}
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-nested text-red-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Form Fields */}
                <div className="space-y-3">
                  {/* Vehicle Picker */}
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      Select Collection Vehicle *
                    </label>
                    <select
                      value={selectedVehicleId}
                      onChange={(e) => handleVehicleChange(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-[#F6F8F7] border border-[#E3E9E5] rounded-nested text-slate-900 focus:outline-none focus:border-[#00993F]"
                    >
                      {availableVehicles.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.plateNumber} — {v.model} ({v.type.replace("_", " ")}, {formatWeight(v.capacityKg, "kg")} cap)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Driver Name */}
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      Assigned Driver Name *
                    </label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 absolute left-3 top-3 text-[#9CA3AF]" />
                      <input
                        type="text"
                        value={driverName}
                        onChange={(e) => setDriverName(e.target.value)}
                        required
                        placeholder="e.g. Mwangi Kimani"
                        className="w-full pl-8 pr-3 py-2 bg-[#F6F8F7] border border-[#E3E9E5] rounded-nested text-slate-900 focus:outline-none focus:border-[#00993F]"
                      />
                    </div>
                  </div>

                  {/* Route Manifest (Optional) */}
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      Route Manifest Assignment
                    </label>
                    <select
                      value={selectedRouteId}
                      onChange={(e) => setSelectedRouteId(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F6F8F7] border border-[#E3E9E5] rounded-nested text-slate-900 focus:outline-none focus:border-[#00993F]"
                    >
                      <option value="">Dedicated Ad-Hoc Run (Direct Dispatch)</option>
                      {availableRoutes.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.routeCode}: {r.name} {r.driverName ? `(${r.driverName})` : ""}
                        </option>
                      ))}
                    </select>
                    <span className="text-[10px] text-[#9CA3AF] block mt-0.5">
                      Assign to an existing active loop or run as an independent on-demand stop.
                    </span>
                  </div>

                  {/* Dispatch Notes / Instructions */}
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      Instructions for Driver / Crew
                    </label>
                    <textarea
                      value={dispatchNotes}
                      onChange={(e) => setDispatchNotes(e.target.value)}
                      rows={2}
                      placeholder="e.g. Confirm weighbridge ticket on exit. Key contact: Sister Agnes."
                      className="w-full px-3 py-2 bg-[#F6F8F7] border border-[#E3E9E5] rounded-nested text-slate-900 focus:outline-none focus:border-[#00993F]"
                    />
                  </div>
                </div>

                {/* Modal Footer Actions */}
                <div className="pt-3 border-t border-[#F0F4F2] flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-3.5 py-2 rounded-nested bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-nested bg-[#00993F] hover:bg-[#008235] text-white font-bold text-xs shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? (
                      <span>Dispatching...</span>
                    ) : (
                      <>
                        <Truck className="w-3.5 h-3.5" />
                        <span>Confirm & Dispatch Truck</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
