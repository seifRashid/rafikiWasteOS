"use client";

import React, { useState } from "react";
import { Calendar, Check, X, Edit3, Sparkles } from "lucide-react";
import { updateClientScheduleAction } from "@/server/actions/clients";
import { getDerivedFrequency } from "@/lib/schedule-utils";

interface EditClientScheduleModalProps {
  client: {
    id: string;
    name: string;
    collectionFrequency?: string;
    collectionDays: string | null;
  };
}

const ALL_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;

export function EditClientScheduleModal({ client }: EditClientScheduleModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Parse initial selected days
  const initialDays = client.collectionDays
    ? client.collectionDays
        .split(",")
        .map((d) => d.trim())
        .filter((d) => ALL_DAYS.includes(d as any))
    : client.collectionFrequency === "daily"
    ? [...ALL_DAYS]
    : client.collectionFrequency === "twice_weekly"
    ? ["Tuesday", "Friday"]
    : ["Wednesday"];

  const [selectedDays, setSelectedDays] = useState<string[]>(initialDays);
  const [notice, setNotice] = useState<string | null>(null);

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const applyPreset = (presetDays: string[]) => {
    setSelectedDays(presetDays);
  };

  const derivedFrequency = getDerivedFrequency(
    selectedDays.length > 0 ? selectedDays.join(", ") : "On-Demand"
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setNotice(null);

    const daysString =
      selectedDays.length === 0
        ? "On-Demand"
        : selectedDays.join(", ");

    try {
      const res = await updateClientScheduleAction(client.id, daysString);

      if (res.success) {
        setNotice("Schedule updated successfully!");
        setTimeout(() => {
          setNotice(null);
          setIsOpen(false);
        }, 800);
      } else {
        alert(res.error || "Failed to update schedule.");
      }
    } catch {
      alert("Error saving collection schedule.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-nested text-xs font-semibold bg-[#F0F4F2] hover:bg-[#E3E9E5] text-slate-700 transition-colors cursor-pointer border border-[#E3E9E5]"
        title="Edit collection schedule days"
      >
        <Edit3 className="w-3 h-3 text-[#00993F]" />
        <span>Edit Days</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-card max-w-md w-full p-6 shadow-modal border border-[#E3E9E5] animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F4F2]">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#00993F]" />
                  <span>Edit Collection Schedule</span>
                </h3>
                <p className="text-[11px] text-[#4B5563] mt-0.5 truncate max-w-xs font-medium">
                  {client.name}
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {notice && (
              <div className="mt-3 p-2.5 rounded-nested bg-[#EDF9F1] border border-[#ADE4C1] text-xs font-bold text-[#00682B] flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>{notice}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
              {/* Quick Presets */}
              <div>
                <label className="font-bold text-[#4B5563] block mb-1.5">
                  Quick Presets
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => applyPreset([...ALL_DAYS])}
                    className="p-2 rounded-nested border border-[#E3E9E5] bg-[#F6F8F7] hover:bg-[#EDF9F1] text-[11px] font-semibold text-slate-700 text-left transition-colors cursor-pointer"
                  >
                    ⚡ Daily (Mon – Sat)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset(["Tuesday", "Friday"])}
                    className="p-2 rounded-nested border border-[#E3E9E5] bg-[#F6F8F7] hover:bg-[#EDF9F1] text-[11px] font-semibold text-slate-700 text-left transition-colors cursor-pointer"
                  >
                    📅 Twice Wk (Tue, Fri)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset(["Wednesday"])}
                    className="p-2 rounded-nested border border-[#E3E9E5] bg-[#F6F8F7] hover:bg-[#EDF9F1] text-[11px] font-semibold text-slate-700 text-left transition-colors cursor-pointer"
                  >
                    📌 Weekly (Wed)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset([])}
                    className="p-2 rounded-nested border border-[#E3E9E5] bg-[#F6F8F7] hover:bg-[#EDF9F1] text-[11px] font-semibold text-slate-700 text-left transition-colors cursor-pointer"
                  >
                    🔔 On-Demand Only
                  </button>
                </div>
              </div>

              {/* Day selection */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-[#4B5563]">
                    Designated Collection Days *
                  </label>
                  <span className="text-[11px] text-[#00993F] font-bold">
                    {selectedDays.length} {selectedDays.length === 1 ? "day" : "days"} selected
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {ALL_DAYS.map((day) => {
                    const isSelected = selectedDays.includes(day);
                    return (
                      <button
                        type="button"
                        key={day}
                        onClick={() => toggleDay(day)}
                        className={`p-2.5 rounded-nested border text-xs font-bold transition-all text-center cursor-pointer ${
                          isSelected
                            ? "bg-[#00993F] text-white border-[#00993F] shadow-xs"
                            : "bg-[#F6F8F7] text-slate-700 border-[#E3E9E5] hover:bg-[#EDF9F1]"
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Live Derived Billing & Contract Frequency */}
              <div className="p-3 rounded-nested bg-[#F0FDF4] border border-[#ADE4C1] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#00993F]" />
                  <div>
                    <div className="text-[10px] text-[#00682B] uppercase font-bold tracking-wider">
                      Derived Contract Frequency
                    </div>
                    <div className="text-xs font-extrabold text-[#00682B]">
                      {derivedFrequency} Service
                    </div>
                  </div>
                </div>
                <span className="text-[10px] text-[#00682B] font-mono font-semibold bg-white/80 px-2 py-0.5 rounded-full border border-[#ADE4C1]">
                  Auto-Calculated
                </span>
              </div>

              <div className="pt-3 border-t border-[#F0F4F2] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-[#4B5563] hover:bg-[#F0F4F2] rounded-nested cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-xs font-bold bg-[#00993F] text-white rounded-nested hover:bg-[#008235] shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save Schedule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
