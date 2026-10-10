"use client";

import React, { useState } from "react";
import { requestExtraPickupAction } from "@/server/actions/client-portal";
import {
  CalendarPlus,
  Clock,
  Trash2,
  Scale,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  Truck,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface BookPickupModalProps {
  clientName?: string;
  defaultStreams?: string;
  buttonLabel?: string;
  variant?: "primary" | "secondary" | "pill";
}

export function BookPickupModal({
  clientName,
  defaultStreams,
  buttonLabel = "Book Extra Pickup",
  variant = "primary",
}: BookPickupModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  // Tomorrow as default date string (YYYY-MM-DD)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().split("T")[0];

  const [pickupDate, setPickupDate] = useState(defaultDateStr);
  const [timeSlot, setTimeSlot] = useState<"morning" | "midday" | "afternoon">("morning");
  const [wasteStream, setWasteStream] = useState<
    "organic" | "recyclable" | "residual" | "hazardous" | "electronic"
  >("organic");
  const [expectedQuantityKg, setExpectedQuantityKg] = useState<number>(300);
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successJob, setSuccessJob] = useState<{ jobNumber: string; scheduledAt: string } | null>(
    null
  );

  const handleOpen = () => {
    setError(null);
    setSuccessJob(null);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    if (successJob) {
      router.refresh();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await requestExtraPickupAction({
        pickupDate,
        timeSlot,
        wasteStream,
        expectedQuantityKg,
        notes,
      });

      if (res.success && res.data) {
        setSuccessJob(res.data);
        setTimeout(() => {
          router.refresh();
        }, 1500);
      } else {
        setError(res.error || "Failed to book collection request.");
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // Button styling based on variant
  const buttonClasses =
    variant === "pill"
      ? "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#00993F] text-white text-xs font-bold shadow-xs hover:bg-[#008235] transition-all cursor-pointer"
      : variant === "secondary"
      ? "flex items-center gap-1.5 px-3.5 py-2 rounded-nested bg-[#EDF9F1] text-[#00682B] text-xs font-bold border border-[#ADE4C1] hover:bg-[#D3F3DE] transition-all cursor-pointer"
      : "flex items-center gap-2 px-4 py-2.5 rounded-nested bg-[#00993F] text-white text-xs font-bold shadow-sm hover:bg-[#008235] transition-all cursor-pointer";

  return (
    <>
      <button onClick={handleOpen} className={buttonClasses}>
        <CalendarPlus className="w-4 h-4" />
        <span>{buttonLabel}</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-card max-w-lg w-full p-6 border border-[#E3E9E5] shadow-2xl space-y-4 animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F4F2]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#EDF9F1] text-[#00993F] flex items-center justify-center font-bold">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Book On-Demand Waste Pickup
                  </h3>
                  <p className="text-[11px] text-[#4B5563]">
                    {clientName || "Schedule extra or emergency collection run"}
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

            {successJob ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#EDF9F1] text-[#00993F] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="text-base font-extrabold text-slate-900">
                  Pickup Successfully Scheduled!
                </h4>
                <p className="text-xs text-[#4B5563] max-w-xs mx-auto">
                  Your request has been registered and dispatched to the operations coordinator.
                </p>

                <div className="p-3 bg-[#F6F8F7] rounded-nested border border-[#E3E9E5] text-xs font-mono max-w-xs mx-auto space-y-1">
                  <div>
                    <span className="text-[#9CA3AF]">Job Number:</span>{" "}
                    <strong className="text-slate-900">{successJob.jobNumber}</strong>
                  </div>
                  <div>
                    <span className="text-[#9CA3AF]">Status:</span>{" "}
                    <strong className="text-[#00993F]">Confirmed & Scheduled</strong>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleClose}
                    className="px-5 py-2 rounded-nested bg-[#00993F] text-white text-xs font-bold hover:bg-[#008235]"
                  >
                    Done & Return to Schedule
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                {error && (
                  <div className="p-3 bg-[#FDE8E8] border border-[#F8B4B4] text-[#E02424] rounded-nested flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Target Pickup Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      Requested Pickup Date *
                    </label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split("T")[0]}
                      value={pickupDate}
                      onChange={(e) => setPickupDate(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F6F8F7] border border-[#E3E9E5] rounded-nested text-slate-900 font-semibold focus:outline-none focus:border-[#00993F]"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      Preferred Time Window
                    </label>
                    <select
                      value={timeSlot}
                      onChange={(e) => setTimeSlot(e.target.value as any)}
                      className="w-full px-3 py-2 bg-[#F6F8F7] border border-[#E3E9E5] rounded-nested text-slate-900 focus:outline-none focus:border-[#00993F]"
                    >
                      <option value="morning">Morning (06:00 - 10:00 AM)</option>
                      <option value="midday">Midday (10:00 - 14:00 PM)</option>
                      <option value="afternoon">Afternoon (14:00 - 18:00 PM)</option>
                    </select>
                  </div>
                </div>

                {/* Waste Stream & Estimated Volume */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      Waste Category / Stream *
                    </label>
                    <select
                      value={wasteStream}
                      onChange={(e) => setWasteStream(e.target.value as any)}
                      className="w-full px-3 py-2 bg-[#F6F8F7] border border-[#E3E9E5] rounded-nested text-slate-900 capitalize focus:outline-none focus:border-[#00993F]"
                    >
                      <option value="organic">Organic Kitchen & Food Waste</option>
                      <option value="recyclable">Dry Recyclables (PET, Glass, OCC)</option>
                      <option value="residual">General Non-Recyclable Residual</option>
                      <option value="electronic">Electronic Waste (E-Waste)</option>
                      <option value="hazardous">Hazardous / Special Waste</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      Estimated Weight (kg) *
                    </label>
                    <input
                      type="number"
                      min={10}
                      step={10}
                      required
                      value={expectedQuantityKg}
                      onChange={(e) => setExpectedQuantityKg(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-[#F6F8F7] border border-[#E3E9E5] rounded-nested text-slate-900 font-bold focus:outline-none focus:border-[#00993F]"
                    />
                  </div>
                </div>

                {/* Quick Presets for Quantity */}
                <div className="flex items-center gap-1.5 pt-0.5">
                  <span className="text-[11px] text-[#9CA3AF] font-bold">Quick Presets:</span>
                  {[100, 250, 500, 1000].map((kg) => (
                    <button
                      key={kg}
                      type="button"
                      onClick={() => setExpectedQuantityKg(kg)}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold border transition-colors ${
                        expectedQuantityKg === kg
                          ? "bg-[#00993F] text-white border-[#00993F]"
                          : "bg-[#F0F4F2] text-[#4B5563] border-[#E3E9E5] hover:bg-[#E3E9E5]"
                      }`}
                    >
                      {kg} kg
                    </button>
                  ))}
                </div>

                {/* Notes / Bay Access instructions */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Bay Access Instructions & Event Details
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Extra banquet overflow, loading bay gate code 4492, ask for John at receiving..."
                    className="w-full p-2.5 bg-[#F6F8F7] border border-[#E3E9E5] rounded-nested text-slate-900 focus:outline-none focus:border-[#00993F]"
                  />
                </div>

                {/* Action Buttons */}
                <div className="pt-3 border-t border-[#F0F4F2] flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-3 py-2 rounded-nested bg-[#F0F4F2] text-slate-700 font-semibold hover:bg-[#E3E9E5]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 rounded-nested bg-[#00993F] text-white font-bold hover:bg-[#008235] disabled:opacity-50"
                  >
                    {loading ? "Scheduling Pickup..." : "Submit Collection Request"}
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
