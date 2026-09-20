"use client";

import React, { useState } from "react";
import Link from "next/link";
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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatWeight } from "@/lib/utils";
import { updateJobStatusAction, reportMissedJobAction } from "@/server/actions/collections";

interface DriverStop {
  id: string;
  seq: number;
  clientName: string;
  phone: string;
  address: string;
  wasteStream: string;
  expectedKg: number;
  notes: string;
  status: "scheduled" | "in_progress" | "collected" | "missed";
}

export function DriverFieldView() {
  const [isOnline, setIsOnline] = useState(true);
  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  const [offlineQueueCount, setOfflineQueueCount] = useState(0);

  // Modal States
  const [modalAction, setModalAction] = useState<"photo" | "weight" | "problem" | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [inputWeight, setInputWeight] = useState("");
  const [problemReason, setProblemReason] = useState("gate_locked");
  const [problemNotes, setProblemNotes] = useState("");
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const [stops, setStops] = useState<DriverStop[]>([
    {
      id: "stop-01",
      seq: 1,
      clientName: "Safari Park Hotel & Casino",
      phone: "+254 722 111 222",
      address: "Thika Road, Kasarani (Rear Kitchen Gate)",
      wasteStream: "Organic Kitchen Waste",
      expectedKg: 1200,
      notes: "Gate code #4412. Ask for Chef David Kariuki.",
      status: "in_progress",
    },
    {
      id: "stop-02",
      seq: 2,
      clientName: "Brookside International School",
      phone: "+254 711 333 444",
      address: "Spring Valley Rd, Westlands",
      wasteStream: "Sorted Recyclable Paper & Bottles",
      expectedKg: 450,
      notes: "Park beside sports pavilion. Security will unlock cage.",
      status: "scheduled",
    },
    {
      id: "stop-03",
      seq: 3,
      clientName: "Java House — Kimathi Street",
      phone: "+254 720 444 555",
      address: "Kimathi & Mama Ngina St, Nairobi CBD",
      wasteStream: "Organic Coffee Grounds & Food",
      expectedKg: 320,
      notes: "Loading zone available before 11:30 AM only.",
      status: "scheduled",
    },
    {
      id: "stop-04",
      seq: 4,
      clientName: "East Africa Bottlers Logistics Park",
      phone: "+254 722 555 666",
      address: "Ruaraka Industrial Area, Outer Ring Rd",
      wasteStream: "Industrial PET & Baled Pallets",
      expectedKg: 2800,
      notes: "Heavy compactor rear-dock collection.",
      status: "scheduled",
    },
  ]);

  const activeStop = stops[currentStopIndex] || stops[0];

  const handleMarkCollected = () => {
    const updated = [...stops];
    updated[currentStopIndex].status = "collected";
    setStops(updated);

    if (!isOnline) {
      setOfflineQueueCount((prev) => prev + 1);
    }

    setSuccessToast(`Stop #${activeStop.seq} Marked Collected! Next stop queued.`);
    setTimeout(() => {
      setSuccessToast(null);
      if (currentStopIndex < stops.length - 1) {
        setCurrentStopIndex(currentStopIndex + 1);
      }
    }, 1500);
  };

  const handleConfirmWeight = () => {
    setModalAction(null);
    setSuccessToast(`Recorded ${inputWeight || activeStop.expectedKg} kg on digital manifest`);
    setTimeout(() => setSuccessToast(null), 2500);
  };

  const handleConfirmProblem = () => {
    const updated = [...stops];
    updated[currentStopIndex].status = "missed";
    setStops(updated);
    setModalAction(null);

    setSuccessToast("Problem logged. Supervisor notified.");
    setTimeout(() => {
      setSuccessToast(null);
      if (currentStopIndex < stops.length - 1) {
        setCurrentStopIndex(currentStopIndex + 1);
      }
    }, 1500);
  };

  return (
    <div className="max-w-md mx-auto space-y-4 pb-20">
      {/* Top Field Bar: Driver & Offline Status */}
      <div className="bg-white rounded-card p-4 border border-[#E3E9E5] shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="w-8 h-8 rounded-full bg-[#F0F4F2] flex items-center justify-center text-[#4B5563]"
            title="Exit to ERP"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="text-xs font-bold text-slate-900">
              Driver Mohammed Bakari
            </div>
            <div className="text-[11px] text-[#00993F] font-semibold flex items-center gap-1">
              <Truck className="w-3 h-3" />
              <span>Truck KDD 482B (20m³)</span>
            </div>
          </div>
        </div>

        {/* Connectivity Switcher */}
        <button
          onClick={() => setIsOnline(!isOnline)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
            isOnline
              ? "bg-[#EDF9F1] text-[#00682B] border border-[#ADE4C1]"
              : "bg-[#FFF8D6] text-[#785608] border border-[#FCE38A]"
          }`}
          title="Toggle Connectivity Mode"
        >
          {isOnline ? (
            <>
              <Wifi className="w-3 h-3" />
              <span>ONLINE</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3" />
              <span>OFFLINE ({offlineQueueCount})</span>
            </>
          )}
        </button>
      </div>

      {/* Success Banner */}
      {successToast && (
        <div className="p-3.5 rounded-nested bg-[#EDF9F1] border border-[#ADE4C1] text-xs font-bold text-[#00682B] flex items-center gap-2 animate-in fade-in shadow-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Route Progress Header Card */}
      <div className="bg-[#111827] text-white rounded-card p-5 shadow-lg">
        <div className="flex items-center justify-between text-xs text-white/80 mb-2">
          <span className="font-semibold uppercase tracking-wider text-[#08A6BA]">
            Westlands Morning Route
          </span>
          <span className="font-mono font-bold text-white">
            Stop {activeStop.seq} of {stops.length}
          </span>
        </div>

        <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden mb-3">
          <div
            className="bg-[#00993F] h-full rounded-full transition-all duration-500"
            style={{ width: `${(activeStop.seq / stops.length) * 100}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-white/70">
          <span>{stops.filter((s) => s.status === "collected").length} Completed</span>
          <span className="text-[#FECA36] font-bold">
            {stops.filter((s) => s.status !== "collected").length} Remaining
          </span>
        </div>
      </div>

      {/* Active Stop Hero Card */}
      <div className="bg-white rounded-card p-6 border-2 border-[#00993F] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-[#00993F] text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-bl-xl tracking-wider">
          NEXT STOP #{activeStop.seq}
        </div>

        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
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
                Expected Weight
              </span>
              <span className="font-mono text-base font-extrabold text-[#00993F]">
                ~{formatWeight(activeStop.expectedKg, "kg")}
              </span>
            </div>
          </div>

          {/* Driver Notes */}
          <div className="p-2.5 rounded-nested bg-[#FFF8D6]/70 border border-[#FCE38A] text-xs text-[#785608]">
            <strong>Instructions:</strong> {activeStop.notes}
          </div>

          {/* Quick Action Navigation & Call Row */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                activeStop.address
              )}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 py-3 rounded-nested bg-[#08A6BA] text-white text-xs font-bold shadow-md hover:bg-[#068A9B] transition-all"
            >
              <Navigation className="w-4 h-4" />
              <span>Navigate</span>
            </a>

            <a
              href={`tel:${activeStop.phone}`}
              className="flex items-center justify-center gap-2 py-3 rounded-nested bg-[#F0F4F2] text-[#111827] text-xs font-bold border border-[#E3E9E5] hover:bg-[#E3E9E5] transition-all"
            >
              <Phone className="w-4 h-4 text-[#00993F]" />
              <span>Call Client</span>
            </a>
          </div>

          {/* Big Field Buttons */}
          <div className="space-y-3 pt-3 border-t border-[#F0F4F2]">
            <button
              onClick={handleMarkCollected}
              className="w-full py-4 rounded-nested bg-[#00993F] text-white text-sm font-extrabold shadow-lg hover:bg-[#008235] flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>MARK STOP AS COLLECTED</span>
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setModalAction("photo")}
                className="py-3 rounded-nested bg-white border border-[#E3E9E5] text-xs font-bold text-[#111827] flex items-center justify-center gap-2 hover:bg-[#F0F4F2]"
              >
                <Camera className="w-4 h-4 text-[#08A6BA]" />
                <span>Take Photo</span>
              </button>

              <button
                onClick={() => {
                  setInputWeight(activeStop.expectedKg.toString());
                  setModalAction("weight");
                }}
                className="py-3 rounded-nested bg-white border border-[#E3E9E5] text-xs font-bold text-[#111827] flex items-center justify-center gap-2 hover:bg-[#F0F4F2]"
              >
                <Scale className="w-4 h-4 text-[#00993F]" />
                <span>Adjust Weight</span>
              </button>
            </div>

            <button
              onClick={() => setModalAction("problem")}
              className="w-full py-2.5 rounded-nested bg-[#FFF8D6] text-[#785608] border border-[#FCE38A] text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-[#FBE492]"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Report Problem (Gate Locked / Bin Empty)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Upcoming Stops Preview Accordion */}
      <div className="bg-white rounded-card p-4 border border-[#E3E9E5]">
        <h4 className="text-xs font-bold text-slate-900 pb-2 mb-2 border-b border-[#F0F4F2]">
          Upcoming Stops Today ({stops.length - 1})
        </h4>
        <div className="space-y-2">
          {stops.map((stop, idx) => (
            <div
              key={stop.id}
              onClick={() => setCurrentStopIndex(idx)}
              className={`p-2.5 rounded-nested text-xs flex items-center justify-between cursor-pointer transition-all ${
                idx === currentStopIndex
                  ? "bg-[#EDF9F1] border border-[#ADE4C1] font-bold text-[#00682B]"
                  : stop.status === "collected"
                  ? "bg-[#F6F8F7] text-[#9CA3AF] line-through"
                  : "bg-white border border-[#E3E9E5] text-slate-800"
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <span className="w-5 h-5 rounded-full bg-[#E3E9E5] text-[10px] flex items-center justify-center font-bold">
                  {stop.seq}
                </span>
                <span className="truncate">{stop.clientName}</span>
              </div>
              <span className="text-[11px] font-mono shrink-0">~{stop.expectedKg} kg</span>
            </div>
          ))}
        </div>
      </div>

      {/* Photo Modal Simulation */}
      {modalAction === "photo" && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-card max-w-xs w-full p-5 shadow-modal">
            <h4 className="text-xs font-bold text-slate-900 pb-2 border-b mb-3">
              Capture Proof of Collection
            </h4>
            <div className="h-44 bg-slate-900 rounded-nested flex flex-col items-center justify-center text-white text-xs gap-2">
              <Camera className="w-8 h-8 text-[#08A6BA] animate-pulse" />
              <span>Camera Sensor Active</span>
              <span className="text-[10px] text-white/60">GPS Stamp: -1.22238, 36.87891</span>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <button
                onClick={() => setModalAction(null)}
                className="flex-1 py-2 rounded-nested bg-[#F0F4F2] text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setModalAction(null);
                  setSuccessToast("Photo attached with GPS coordinates!");
                  setTimeout(() => setSuccessToast(null), 2000);
                }}
                className="flex-1 py-2 rounded-nested bg-[#00993F] text-white text-xs font-bold"
              >
                Save Photo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Weight Adjust Modal */}
      {modalAction === "weight" && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-card max-w-xs w-full p-5 shadow-modal">
            <h4 className="text-xs font-bold text-slate-900 pb-2 border-b mb-3">
              Adjust Actual Weight (kg)
            </h4>
            <input
              type="number"
              value={inputWeight}
              onChange={(e) => setInputWeight(e.target.value)}
              className="w-full p-3 font-mono text-xl font-extrabold text-center rounded-nested border-2 border-[#00993F] focus:outline-none"
            />
            <div className="flex items-center gap-2 mt-4">
              <button
                onClick={() => setModalAction(null)}
                className="flex-1 py-2 rounded-nested bg-[#F0F4F2] text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmWeight}
                className="flex-1 py-2 rounded-nested bg-[#00993F] text-white text-xs font-bold"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Problem Modal */}
      {modalAction === "problem" && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-card max-w-xs w-full p-5 shadow-modal text-xs">
            <h4 className="text-xs font-bold text-red-600 pb-2 border-b mb-3 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              <span>Report Collection Problem</span>
            </h4>
            <div className="space-y-3">
              <div>
                <label className="font-bold block mb-1">Reason</label>
                <select
                  value={problemReason}
                  onChange={(e) => setProblemReason(e.target.value)}
                  className="w-full p-2 border rounded-nested bg-white"
                >
                  <option value="gate_locked">Compound Gate Locked / No Security</option>
                  <option value="access_blocked">Access Road Blocked by Truck</option>
                  <option value="bin_empty">Bins Empty / Customer Cancelled</option>
                </select>
              </div>
              <div>
                <label className="font-bold block mb-1">Quick Note</label>
                <textarea
                  rows={2}
                  placeholder="Security guard was not present..."
                  value={problemNotes}
                  onChange={(e) => setProblemNotes(e.target.value)}
                  className="w-full p-2 border rounded-nested"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <button
                onClick={() => setModalAction(null)}
                className="flex-1 py-2 rounded-nested bg-[#F0F4F2] text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmProblem}
                className="flex-1 py-2 rounded-nested bg-red-600 text-white text-xs font-bold"
              >
                Report Missed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
