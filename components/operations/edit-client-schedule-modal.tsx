"use client";

import React, { useState } from "react";
import { Calendar, Clock, Check, X, Edit3 } from "lucide-react";
import { updateClientScheduleAction } from "@/server/actions/clients";

interface EditClientScheduleModalProps {
  client: {
    id: string;
    name: string;
    collectionFrequency: string;
    collectionDays: string | null;
  };
}

const ALL_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;

export function EditClientScheduleModal({ client }: EditClientScheduleModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [frequency, setFrequency] = useState<string>(client.collectionFrequency || "weekly");
  
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

  const handleFrequencyChange = (newFreq: string) => {
    setFrequency(newFreq);
    if (newFreq === "daily") {
      setSelectedDays([...ALL_DAYS]);
    } else if (newFreq === "twice_weekly" && selectedDays.length <= 1) {
      setSelectedDays(["Tuesday", "Friday"]);
    } else if (newFreq === "weekly" && selectedDays.length === 0) {
      setSelectedDays(["Wednesday"]);
    } else if (newFreq === "on_demand") {
      setSelectedDays([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setNotice(null);

    const daysString =
      frequency === "on_demand" && selectedDays.length === 0
        ? "On-Demand"
        : selectedDays.length > 0
        ? selectedDays.join(", ")
        : "Wednesday";

    try {
      const res = await updateClientScheduleAction(
        client.id,
        daysString,
        frequency as any
      );

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
                className="text-slate-400 hover:text-slate-700 p-1"
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
              <div>
                <label className="font-bold text-[#4B5563] block mb-1">
                  Contract Service Frequency
                </label>
                <select
                  value={frequency}
                  onChange={(e) => handleFrequencyChange(e.target.value)}
                  className="w-full p-2.5 rounded-nested border border-[#E3E9E5] bg-white text-slate-900 font-semibold focus:outline-none focus:border-[#00993F]"
                >
                  <option value="daily">Daily (Mon - Sat)</option>
                  <option value="twice_weekly">Twice Weekly</option>
                  <option value="weekly">Weekly</option>
                  <option value="bi_weekly">Bi-Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="on_demand">On-Demand Request</option>
                </select>
              </div>

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
                <p className="text-[10px] text-[#9CA3AF] mt-1.5">
                  Collection manifests and daily dispatch stops are generated for the days selected above.
                </p>
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
