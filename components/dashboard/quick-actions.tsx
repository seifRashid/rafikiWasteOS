"use client";

import React, { useState } from "react";
import { Plus, Scale, Truck, Check, X } from "lucide-react";
import { createJobAction } from "@/server/actions/collections";
import { recordMaterialIntakeAction } from "@/server/actions/inventory";

interface QuickActionsProps {
  clientsList?: Array<{ id: string; name: string }>;
}

export function QuickActions({ clientsList = [] }: QuickActionsProps) {
  const [openModal, setOpenModal] = useState<"pickup" | "scale" | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Pickup Form State
  const [selectedClient, setSelectedClient] = useState(clientsList[0]?.id || "");
  const [wasteStream, setWasteStream] = useState<
    "organic" | "recyclable" | "residual" | "hazardous"
  >("recyclable");
  const [expectedKg, setExpectedKg] = useState("500");

  // Scale Form State
  const [materialType, setMaterialType] = useState<
    "pet_plastic" | "hdpe_plastic" | "cardboard_occ" | "aluminium_cans"
  >("pet_plastic");
  const [weightKg, setWeightKg] = useState("1200");
  const [storageBay, setStorageBay] = useState("Bay 01 - Baled PET");

  const handleSchedulePickup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await createJobAction({
        clientId: selectedClient || clientsList[0]?.id || "",
        wasteStream,
        expectedQuantityKg: parseFloat(expectedKg) || 100,
        scheduledAt: new Date().toISOString(),
        notes: "Scheduled via Dashboard Quick Action",
      });
      if (res.success) {
        setSuccessMsg("Collection job scheduled successfully!");
        setTimeout(() => {
          setSuccessMsg(null);
          setOpenModal(null);
        }, 1500);
      }
    } catch {
      alert("Failed to schedule pickup");
    } finally {
      setLoading(false);
    }
  };

  const handleRecordIntake = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await recordMaterialIntakeAction({
        materialType,
        gradeQuality: "Standard",
        collectedWeightKg: parseFloat(weightKg) || 500,
        storageBay,
        notes: "Depot weighbridge intake",
      });
      if (res.success) {
        setSuccessMsg("Weighbridge material intake recorded!");
        setTimeout(() => {
          setSuccessMsg(null);
          setOpenModal(null);
        }, 1500);
      }
    } catch {
      alert("Failed to record intake");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setOpenModal("pickup")}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-nested bg-[#00993F] text-white text-xs font-semibold shadow-sm hover:bg-[#008235] transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Dispatch Pickup</span>
        </button>

        <button
          onClick={() => setOpenModal("scale")}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-nested bg-white border border-[#E3E9E5] text-[#111827] text-xs font-semibold shadow-xs hover:bg-[#F0F4F2] transition-all"
        >
          <Scale className="w-3.5 h-3.5 text-[#00993F]" />
          <span>Weighbridge Intake</span>
        </button>
      </div>

      {/* Dispatch Pickup Modal */}
      {openModal === "pickup" && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-card max-w-md w-full p-6 shadow-modal border border-[#E3E9E5] animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F4F2]">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#00993F]" />
                Dispatch On-Demand Pickup
              </h3>
              <button
                onClick={() => setOpenModal(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {successMsg ? (
              <div className="py-8 text-center">
                <div className="w-12 h-12 rounded-full bg-[#EDF9F1] text-[#00993F] flex items-center justify-center mx-auto mb-3">
                  <Check className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-[#00682B]">{successMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleSchedulePickup} className="mt-4 space-y-3">
                <div>
                  <label className="text-xs font-bold text-[#4B5563] block mb-1">
                    Client Location
                  </label>
                  <select
                    value={selectedClient}
                    onChange={(e) => setSelectedClient(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-nested border border-[#E3E9E5] bg-white focus:outline-none focus:border-[#00993F]"
                  >
                    {clientsList.length > 0 ? (
                      clientsList.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))
                    ) : (
                      <option value="">Safari Park Hotel & Casino</option>
                    )}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-[#4B5563] block mb-1">
                      Waste Stream
                    </label>
                    <select
                      value={wasteStream}
                      onChange={(e) => setWasteStream(e.target.value as any)}
                      className="w-full text-xs p-2.5 rounded-nested border border-[#E3E9E5] bg-white focus:outline-none focus:border-[#00993F]"
                    >
                      <option value="recyclable">Recyclable (PET/OCC)</option>
                      <option value="organic">Organic (Food Waste)</option>
                      <option value="residual">Residual / Landfill</option>
                      <option value="hazardous">Hazardous / Special</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#4B5563] block mb-1">
                      Expected (kg)
                    </label>
                    <input
                      type="number"
                      value={expectedKg}
                      onChange={(e) => setExpectedKg(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-nested border border-[#E3E9E5] bg-white focus:outline-none focus:border-[#00993F]"
                      required
                    />
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setOpenModal(null)}
                    className="px-4 py-2 text-xs font-semibold text-[#4B5563] hover:bg-[#F0F4F2] rounded-nested"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 text-xs font-semibold bg-[#00993F] text-white rounded-nested hover:bg-[#008235] transition-colors disabled:opacity-50"
                  >
                    {loading ? "Dispatching..." : "Confirm & Dispatch"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Weighbridge Intake Modal */}
      {openModal === "scale" && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-card max-w-md w-full p-6 shadow-modal border border-[#E3E9E5] animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F4F2]">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Scale className="w-4 h-4 text-[#08A6BA]" />
                Depot Weighbridge Intake
              </h3>
              <button
                onClick={() => setOpenModal(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {successMsg ? (
              <div className="py-8 text-center">
                <div className="w-12 h-12 rounded-full bg-[#EDF9F1] text-[#00993F] flex items-center justify-center mx-auto mb-3">
                  <Check className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-[#00682B]">{successMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleRecordIntake} className="mt-4 space-y-3">
                <div>
                  <label className="text-xs font-bold text-[#4B5563] block mb-1">
                    Material Stream
                  </label>
                  <select
                    value={materialType}
                    onChange={(e) => setMaterialType(e.target.value as any)}
                    className="w-full text-xs p-2.5 rounded-nested border border-[#E3E9E5] bg-white focus:outline-none focus:border-[#00993F]"
                  >
                    <option value="pet_plastic">PET Plastic (Bottles/Flakes)</option>
                    <option value="hdpe_plastic">HDPE Plastic (Rigids/Drums)</option>
                    <option value="cardboard_occ">Cardboard (OCC Baled)</option>
                    <option value="aluminium_cans">Aluminium UBC Cans</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-[#4B5563] block mb-1">
                      Net Weight (kg)
                    </label>
                    <input
                      type="number"
                      value={weightKg}
                      onChange={(e) => setWeightKg(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-nested border border-[#E3E9E5] bg-white focus:outline-none focus:border-[#00993F]"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#4B5563] block mb-1">
                      Storage Bay
                    </label>
                    <input
                      type="text"
                      value={storageBay}
                      onChange={(e) => setStorageBay(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-nested border border-[#E3E9E5] bg-white focus:outline-none focus:border-[#00993F]"
                      required
                    />
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setOpenModal(null)}
                    className="px-4 py-2 text-xs font-semibold text-[#4B5563] hover:bg-[#F0F4F2] rounded-nested"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 text-xs font-semibold bg-[#08A6BA] text-white rounded-nested hover:bg-[#068A9B] transition-colors disabled:opacity-50"
                  >
                    {loading ? "Recording..." : "Record Intake"}
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
