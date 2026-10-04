"use client";

import React, { useState } from "react";
import {
  Recycle,
  Search,
  Plus,
  DollarSign,
  Scale,
  Warehouse,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  X,
  Check,
  Package,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { formatWeight, formatCurrency, formatDate } from "@/lib/utils";
import {
  recordMaterialIntakeAction,
  updateMaterialStageAction,
  recordMaterialSaleAction,
} from "@/server/actions/inventory";
import type { RecyclableInventory } from "@/server/db/schema";

interface InventoryViewProps {
  initialBatches: RecyclableInventory[];
}

export function InventoryView({ initialBatches }: InventoryViewProps) {
  const [batches, setBatches] = useState<RecyclableInventory[]>(initialBatches);
  const [selectedStage, setSelectedStage] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Sale Modal State
  const [selectedBatchForSale, setSelectedBatchForSale] = useState<RecyclableInventory | null>(null);
  const [buyerName, setBuyerName] = useState("");
  const [unitPrice, setUnitPrice] = useState("38.50");
  const [soldWeight, setSoldWeight] = useState("");
  const [saleLoading, setSaleLoading] = useState(false);

  // Intake Modal State
  const [isIntakeOpen, setIsIntakeOpen] = useState(false);
  const [materialType, setMaterialType] = useState<any>("pet_plastic");
  const [gradeQuality, setGradeQuality] = useState("Grade A (Clear)");
  const [intakeWeight, setIntakeWeight] = useState("2500");
  const [storageBay, setStorageBay] = useState("Bay 01 - Baled PET");
  const [intakeLoading, setIntakeLoading] = useState(false);

  const stages = [
    { id: "all", label: "All Stages" },
    { id: "collected", label: "1. Collected" },
    { id: "sorted", label: "2. Sorted" },
    { id: "stored", label: "3. Stored (Baled)" },
    { id: "processed", label: "4. Processed" },
    { id: "sold", label: "5. Sold / Transferred" },
  ];

  // Aggregates
  let totalStockKg = 0;
  let totalRevenue = 0;
  let totalShrinkageKg = 0;

  batches.forEach((b) => {
    totalStockKg += parseFloat(b.currentWeightKg || "0");
    if (b.totalRevenue) totalRevenue += parseFloat(b.totalRevenue);
    if (b.rejectedWeightKg) totalShrinkageKg += parseFloat(b.rejectedWeightKg);
  });

  const filteredBatches = batches.filter((b) => {
    const matchesSearch =
      b.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.materialType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.storageBay.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.buyerName && b.buyerName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStage = selectedStage === "all" || b.stage === selectedStage;
    return matchesSearch && matchesStage;
  });

  const handleRecordSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatchForSale) return;
    setSaleLoading(true);

    try {
      const price = parseFloat(unitPrice);
      const weight = parseFloat(soldWeight) || parseFloat(selectedBatchForSale.currentWeightKg);
      const res = await recordMaterialSaleAction({
        batchId: selectedBatchForSale.id,
        buyerName,
        unitSellingPrice: price,
        soldWeightKg: weight,
        notes: "Scrap sale dispatch verified",
      });

      if (res.success && res.totalRevenue) {
        setBatches(
          batches.map((b) =>
            b.id === selectedBatchForSale.id
              ? {
                  ...b,
                  stage: "sold",
                  buyerName,
                  unitSellingPrice: price.toFixed(2),
                  totalRevenue: res.totalRevenue.toFixed(2),
                  currentWeightKg: "0.00",
                }
              : b
          )
        );
        setSelectedBatchForSale(null);
        setBuyerName("");
      } else {
        alert(res.error || "Sale failed");
      }
    } catch {
      alert("Error occurred recording sale");
    } finally {
      setSaleLoading(false);
    }
  };

  const handleRecordIntake = async (e: React.FormEvent) => {
    e.preventDefault();
    setIntakeLoading(true);
    try {
      const weight = parseFloat(intakeWeight);
      const res = await recordMaterialIntakeAction({
        materialType,
        gradeQuality,
        collectedWeightKg: weight,
        storageBay,
      });

      if (res.success && res.data) {
        setBatches([res.data as RecyclableInventory, ...batches]);
        setIsIntakeOpen(false);
      }
    } catch {
      alert("Failed to record intake");
    } finally {
      setIntakeLoading(false);
    }
  };

  const handleAdvanceStage = async (batchId: string, nextStage: any) => {
    try {
      const res = await updateMaterialStageAction(batchId, nextStage);
      if (res.success) {
        setBatches(
          batches.map((b) => (b.id === batchId ? { ...b, stage: nextStage } : b))
        );
      }
    } catch {
      alert("Failed to advance stage");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E3E9E5]">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Recyclable Material Inventory
          </h1>
          <p className="text-xs text-[#4B5563] mt-0.5">
            Material flow tracking: Collected → Sorted → Baled → Processed → Sold with sorting shrinkage auditing.
          </p>
        </div>

        <button
          onClick={() => setIsIntakeOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-nested bg-[#00993F] text-white text-xs font-semibold shadow-sm hover:bg-[#008235] transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Intake New Batch</span>
        </button>
      </div>

      {/* Inventory KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Current Stock in Bales"
          value={formatWeight(totalStockKg, "tonnes")}
          subtitle="Ready in depot warehouse"
          icon={<Warehouse className="w-5 h-5" />}
          accentColor="primary"
        />

        <StatCard
          title="Scrap Sales Revenue"
          value={formatCurrency(totalRevenue, "KES", true)}
          subtitle="Baled materials sold"
          icon={<DollarSign className="w-5 h-5" />}
          accentColor="cyan"
          trend={{ value: "+18%", isPositive: true, label: "Price growth" }}
        />

        <StatCard
          title="Sorting Shrinkage"
          value={formatWeight(totalShrinkageKg, "kg")}
          subtitle="Contamination & rejects"
          icon={<AlertTriangle className="w-5 h-5" />}
          accentColor="amber"
        />

        <StatCard
          title="Active Batches"
          value={batches.length}
          subtitle="Tracked across 5 bays"
          icon={<Package className="w-5 h-5" />}
          accentColor="neutral"
        />
      </div>

      {/* Stage Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {stages.map((st) => {
          const isSelected = selectedStage === st.id;
          return (
            <button
              key={st.id}
              onClick={() => setSelectedStage(st.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                isSelected
                  ? "bg-[#00993F] text-white shadow-sm"
                  : "bg-white text-[#4B5563] border border-[#E3E9E5] hover:bg-[#F0F4F2]"
              }`}
            >
              {st.label}
            </button>
          );
        })}
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative max-w-md w-full">
          <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by batch #, material type, bay, or buyer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-[#E3E9E5] rounded-full text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#00993F]"
          />
        </div>
      </div>

      {/* Material Flow Batch Table */}
      <div className="bg-white rounded-card border border-[#E3E9E5] shadow-card-elevated overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F6F8F7] border-b border-[#E3E9E5]">
              <tr className="text-[#4B5563] font-semibold">
                <th className="py-3 px-4">Batch Number</th>
                <th className="py-3 px-4">Material & Quality</th>
                <th className="py-3 px-4">Collected → Sorted</th>
                <th className="py-3 px-4">Shrinkage Rejects</th>
                <th className="py-3 px-4">Current Stock</th>
                <th className="py-3 px-4">Storage Bay</th>
                <th className="py-3 px-4">Stage</th>
                <th className="py-3 px-4">Buyer & Revenue</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F4F2]">
              {filteredBatches.map((batch) => (
                <tr key={batch.id} className="hover:bg-[#F6F8F7] transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    {batch.batchNumber}
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 capitalize">
                      {batch.materialType.replace("_", " ")}
                    </div>
                    <div className="text-[11px] text-[#00993F] font-semibold">
                      {batch.gradeQuality}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-mono">
                    <div className="font-bold text-slate-900">
                      {formatWeight(batch.sortedWeightKg || batch.collectedWeightKg, "kg")}
                    </div>
                    <div className="text-[10px] text-[#9CA3AF]">
                      Intake: {formatWeight(batch.collectedWeightKg, "kg")}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-amber-800">
                    {batch.rejectedWeightKg && parseFloat(batch.rejectedWeightKg) > 0 ? (
                      <span className="bg-[#FFF8D6] px-2 py-0.5 rounded-full font-bold">
                        -{formatWeight(batch.rejectedWeightKg, "kg")}
                      </span>
                    ) : (
                      <span className="text-[#9CA3AF]">0 kg</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    {formatWeight(batch.currentWeightKg, "kg")}
                  </td>

                  <td className="py-3.5 px-4 text-[#4B5563]">
                    <div className="font-semibold text-slate-800">{batch.storageBay}</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <Badge
                      variant={
                        batch.stage === "sold"
                          ? "primary"
                          : batch.stage === "stored"
                          ? "cyan"
                          : batch.stage === "processed"
                          ? "amber"
                          : "neutral"
                      }
                      dot
                    >
                      {batch.stage}
                    </Badge>
                  </td>

                  <td className="py-3.5 px-4">
                    {batch.buyerName ? (
                      <div>
                        <div className="font-semibold text-slate-800">{batch.buyerName}</div>
                        <div className="font-mono font-bold text-[#00993F] text-[11px]">
                          {formatCurrency(batch.totalRevenue, "KES")} ({formatCurrency(batch.unitSellingPrice, "KES")}/kg)
                        </div>
                      </div>
                    ) : (
                      <span className="text-[#9CA3AF]">—</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {batch.stage === "stored" && (
                        <button
                          onClick={() => {
                            setSelectedBatchForSale(batch);
                            setSoldWeight(batch.currentWeightKg);
                          }}
                          className="px-2.5 py-1 rounded-nested bg-[#EDF9F1] text-[#00682B] border border-[#ADE4C1] text-[11px] font-bold hover:bg-[#D3F3DE] flex items-center gap-1"
                        >
                          <DollarSign className="w-3 h-3" />
                          <span>Record Sale</span>
                        </button>
                      )}

                      {batch.stage === "collected" && (
                        <button
                          onClick={() => handleAdvanceStage(batch.id, "sorted")}
                          className="px-2.5 py-1 rounded-nested bg-[#00993F] text-white text-[11px] font-bold hover:bg-[#008235]"
                        >
                          Mark Sorted
                        </button>
                      )}

                      {batch.stage === "sorted" && (
                        <button
                          onClick={() => handleAdvanceStage(batch.id, "stored")}
                          className="px-2.5 py-1 rounded-nested bg-[#08A6BA] text-white text-[11px] font-bold hover:bg-[#068A9B]"
                        >
                          Store in Bay
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Scrap Sale Modal */}
      {selectedBatchForSale && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-card max-w-md w-full p-6 shadow-modal border border-[#E3E9E5] animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F4F2]">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[#00993F]" />
                Record Material Scrap Sale
              </h3>
              <button
                onClick={() => setSelectedBatchForSale(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-3 p-2.5 rounded-nested bg-[#F6F8F7] border border-[#E3E9E5] text-xs">
              <span className="text-[#9CA3AF] block font-medium">Batch:</span>
              <span className="font-mono font-bold text-slate-900">
                {selectedBatchForSale.batchNumber} • {selectedBatchForSale.materialType.replace("_", " ")}
              </span>
            </div>

            <form onSubmit={handleRecordSale} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-[#4B5563] block mb-1">
                  Buyer Company Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. EcoPlast Converters Ltd"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  className="w-full p-2.5 rounded-nested border border-[#E3E9E5] focus:outline-none focus:border-[#00993F]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#4B5563] block mb-1">
                    Unit Price (KES / kg) *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(e.target.value)}
                    className="w-full p-2.5 rounded-nested border border-[#E3E9E5] font-mono focus:outline-none focus:border-[#00993F]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#4B5563] block mb-1">
                    Weight Sold (kg) *
                  </label>
                  <input
                    type="number"
                    required
                    value={soldWeight}
                    onChange={(e) => setSoldWeight(e.target.value)}
                    className="w-full p-2.5 rounded-nested border border-[#E3E9E5] font-mono focus:outline-none focus:border-[#00993F]"
                  />
                </div>
              </div>

              {/* Total Revenue Preview */}
              {parseFloat(unitPrice) > 0 && parseFloat(soldWeight) > 0 && (
                <div className="p-3 rounded-nested bg-[#EDF9F1] border border-[#ADE4C1] flex items-center justify-between">
                  <span className="font-bold text-[#00682B]">Total Sale Revenue:</span>
                  <span className="font-mono text-base font-extrabold text-[#00682B]">
                    {formatCurrency(parseFloat(unitPrice) * parseFloat(soldWeight), "KES")}
                  </span>
                </div>
              )}

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#F0F4F2]">
                <button
                  type="button"
                  onClick={() => setSelectedBatchForSale(null)}
                  className="px-4 py-2 text-xs font-semibold text-[#4B5563] hover:bg-[#F0F4F2] rounded-nested"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saleLoading}
                  className="px-4 py-2 text-xs font-semibold bg-[#00993F] text-white rounded-nested hover:bg-[#008235] transition-colors disabled:opacity-50"
                >
                  {saleLoading ? "Recording..." : "Dispatch & Invoice Sale"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Intake Batch Modal */}
      {isIntakeOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-card max-w-md w-full p-6 shadow-modal border border-[#E3E9E5] animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F4F2]">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#00993F]" />
                Intake Recyclable Material Batch
              </h3>
              <button
                onClick={() => setIsIntakeOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRecordIntake} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-[#4B5563] block mb-1">
                  Material Stream *
                </label>
                <select
                  value={materialType}
                  onChange={(e) => setMaterialType(e.target.value)}
                  className="w-full p-2.5 rounded-nested border border-[#E3E9E5] bg-white focus:outline-none focus:border-[#00993F]"
                >
                  <option value="pet_plastic">PET Plastic Bottles</option>
                  <option value="hdpe_plastic">HDPE Rigid Drums/Cans</option>
                  <option value="cardboard_occ">Cardboard (OCC)</option>
                  <option value="aluminium_cans">Aluminium UBC Cans</option>
                  <option value="organic_compost">Organics / Food Waste</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#4B5563] block mb-1">
                    Grade / Quality
                  </label>
                  <input
                    type="text"
                    value={gradeQuality}
                    onChange={(e) => setGradeQuality(e.target.value)}
                    className="w-full p-2.5 rounded-nested border border-[#E3E9E5] focus:outline-none focus:border-[#00993F]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#4B5563] block mb-1">
                    Collected Weight (kg) *
                  </label>
                  <input
                    type="number"
                    required
                    value={intakeWeight}
                    onChange={(e) => setIntakeWeight(e.target.value)}
                    className="w-full p-2.5 rounded-nested border border-[#E3E9E5] font-mono focus:outline-none focus:border-[#00993F]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#4B5563] block mb-1">
                  Assigned Storage Bay *
                </label>
                <input
                  type="text"
                  required
                  value={storageBay}
                  onChange={(e) => setStorageBay(e.target.value)}
                  className="w-full p-2.5 rounded-nested border border-[#E3E9E5] focus:outline-none focus:border-[#00993F]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#F0F4F2]">
                <button
                  type="button"
                  onClick={() => setIsIntakeOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#4B5563] hover:bg-[#F0F4F2] rounded-nested"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={intakeLoading}
                  className="px-4 py-2 text-xs font-semibold bg-[#00993F] text-white rounded-nested hover:bg-[#008235] transition-colors disabled:opacity-50"
                >
                  {intakeLoading ? "Saving..." : "Save Batch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
