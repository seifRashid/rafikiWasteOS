"use client";

import React, { useState } from "react";
import {
  Package,
  Scale,
  Plus,
  Pencil,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  Trash2,
  Radio,
  Cpu,
  Layers,
  Archive,
  BarChart3,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { formatCurrency } from "@/lib/utils";
import type { ContainerType, Asset } from "@/server/db/schema";
import {
  createContainerTypeAction,
  updateContainerTypeAction,
  createAssetAction,
  updateAssetAction,
} from "@/server/actions/containers";

export interface EnrichedContainerType extends ContainerType {
  allocatedCount?: number;
  availableDepotStock?: number;
}

interface ContainersAndAssetsViewProps {
  initialContainerTypes: EnrichedContainerType[];
  initialAssets: Asset[];
  initialTotalStock: number;
  initialTotalAllocated: number;
  initialTotalInDepot: number;
}

interface ContainerFormState {
  id?: string;
  code: string;
  name: string;
  category: string;
  capacityLitres: string;
  compatibleStream: string;
  totalStock: string;
  colorCode: string;
  rfidTracked: boolean;
  description: string;
}

const emptyContainerForm: ContainerFormState = {
  code: "",
  name: "",
  category: "wheelie_bin",
  capacityLitres: "240",
  compatibleStream: "All Streams",
  totalStock: "50",
  colorCode: "#00993F",
  rfidTracked: true,
  description: "",
};

interface AssetFormState {
  id?: string;
  assetTag: string;
  name: string;
  category:
    | "wheeled_bin_240l"
    | "wheeled_bin_1100l"
    | "static_compactor"
    | "weighbridge_scale"
    | "baling_press"
    | "shredder";
  location: string;
  condition: "Excellent" | "Good" | "Fair" | "Damaged";
  purchaseCost: string;
}

const emptyAssetForm: AssetFormState = {
  assetTag: "",
  name: "",
  category: "wheeled_bin_240l",
  location: "Central Depot Yard",
  condition: "Good",
  purchaseCost: "0",
};

export function ContainersAndAssetsView({
  initialContainerTypes,
  initialAssets,
  initialTotalStock,
  initialTotalAllocated,
  initialTotalInDepot,
}: ContainersAndAssetsViewProps) {
  const [activeTab, setActiveTab] = useState<"containers" | "assets">("containers");
  const [containerTypes, setContainerTypes] = useState<EnrichedContainerType[]>(initialContainerTypes);
  const [assets, setAssets] = useState<Asset[]>(initialAssets);

  // Modals state
  const [isContainerModalOpen, setIsContainerModalOpen] = useState(false);
  const [containerModalMode, setContainerModalMode] = useState<"add" | "edit">("add");
  const [containerFormData, setContainerFormData] = useState<ContainerFormState>(emptyContainerForm);

  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [assetModalMode, setAssetModalMode] = useState<"add" | "edit">("add");
  const [assetFormData, setAssetFormData] = useState<AssetFormState>(emptyAssetForm);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Container stats recalculation
  const totalFleetStock = containerTypes.reduce((acc, c) => acc + (c.totalStock || 0), 0);
  const totalAllocated = containerTypes.reduce((acc, c) => acc + (c.allocatedCount || 0), 0);
  const totalInDepot = Math.max(0, totalFleetStock - totalAllocated);

  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  // Container Handlers
  const openAddContainerModal = () => {
    setContainerModalMode("add");
    setContainerFormData(emptyContainerForm);
    setFormError(null);
    setIsContainerModalOpen(true);
  };

  const openEditContainerModal = (item: EnrichedContainerType) => {
    setContainerModalMode("edit");
    setContainerFormData({
      id: item.id,
      code: item.code,
      name: item.name,
      category: item.category,
      capacityLitres: item.capacityLitres.toString(),
      compatibleStream: item.compatibleStream,
      totalStock: item.totalStock.toString(),
      colorCode: item.colorCode || "#00993F",
      rfidTracked: item.rfidTracked ?? true,
      description: item.description || "",
    });
    setFormError(null);
    setIsContainerModalOpen(true);
  };

  const handleContainerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);

    const cap = parseInt(containerFormData.capacityLitres, 10);
    const stock = parseInt(containerFormData.totalStock, 10);

    if (isNaN(cap) || cap <= 0) {
      setFormError("Capacity must be a valid positive number of litres.");
      setSubmitting(false);
      return;
    }

    if (isNaN(stock) || stock < 0) {
      setFormError("Total stock must be non-negative.");
      setSubmitting(false);
      return;
    }

    try {
      if (containerModalMode === "add") {
        const res = await createContainerTypeAction({
          code: containerFormData.code,
          name: containerFormData.name,
          category: containerFormData.category,
          capacityLitres: cap,
          compatibleStream: containerFormData.compatibleStream,
          totalStock: stock,
          colorCode: containerFormData.colorCode,
          rfidTracked: containerFormData.rfidTracked,
          description: containerFormData.description || null,
        });

        if (res.success && res.data) {
          const newEnriched: EnrichedContainerType = {
            ...res.data,
            allocatedCount: 0,
            availableDepotStock: res.data.totalStock,
          };
          setContainerTypes((prev) => [...prev, newEnriched]);
          triggerToast(`Container model "${containerFormData.name}" added successfully!`);
          setIsContainerModalOpen(false);
        } else {
          setFormError(res.error || "Failed to create container type.");
        }
      } else {
        if (!containerFormData.id) {
          setFormError("Missing container type identifier.");
          setSubmitting(false);
          return;
        }

        const res = await updateContainerTypeAction({
          id: containerFormData.id,
          code: containerFormData.code,
          name: containerFormData.name,
          category: containerFormData.category,
          capacityLitres: cap,
          compatibleStream: containerFormData.compatibleStream,
          totalStock: stock,
          colorCode: containerFormData.colorCode,
          rfidTracked: containerFormData.rfidTracked,
          description: containerFormData.description || null,
        });

        if (res.success && res.data) {
          setContainerTypes((prev) =>
            prev.map((item) => {
              if (item.id === containerFormData.id) {
                const allocated = item.allocatedCount || 0;
                return {
                  ...res.data,
                  allocatedCount: allocated,
                  availableDepotStock: Math.max(0, res.data.totalStock - allocated),
                };
              }
              return item;
            })
          );
          triggerToast(`Container model "${containerFormData.name}" updated successfully!`);
          setIsContainerModalOpen(false);
        } else {
          setFormError(res.error || "Failed to update container type.");
        }
      }
    } catch {
      setFormError("An unexpected server error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  // Asset Handlers
  const openAddAssetModal = () => {
    setAssetModalMode("add");
    setAssetFormData(emptyAssetForm);
    setFormError(null);
    setIsAssetModalOpen(true);
  };

  const openEditAssetModal = (item: Asset) => {
    setAssetModalMode("edit");
    setAssetFormData({
      id: item.id,
      assetTag: item.assetTag,
      name: item.name,
      category: item.category as any,
      location: item.location,
      condition: item.condition as any,
      purchaseCost: item.purchaseCost ? item.purchaseCost.toString() : "0",
    });
    setFormError(null);
    setIsAssetModalOpen(true);
  };

  const handleAssetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);

    const cost = parseFloat(assetFormData.purchaseCost);

    try {
      if (assetModalMode === "add") {
        const res = await createAssetAction({
          assetTag: assetFormData.assetTag,
          name: assetFormData.name,
          category: assetFormData.category,
          location: assetFormData.location,
          condition: assetFormData.condition,
          purchaseCost: isNaN(cost) ? null : cost,
        });

        if (res.success && res.data) {
          setAssets((prev) => [res.data as Asset, ...prev]);
          triggerToast(`Asset "${assetFormData.name}" registered successfully!`);
          setIsAssetModalOpen(false);
        } else {
          setFormError(res.error || "Failed to register asset.");
        }
      } else {
        if (!assetFormData.id) {
          setFormError("Missing asset identifier.");
          setSubmitting(false);
          return;
        }

        const res = await updateAssetAction({
          id: assetFormData.id,
          assetTag: assetFormData.assetTag,
          name: assetFormData.name,
          category: assetFormData.category,
          location: assetFormData.location,
          condition: assetFormData.condition,
          purchaseCost: isNaN(cost) ? null : cost,
        });

        if (res.success && res.data) {
          setAssets((prev) =>
            prev.map((item) => (item.id === assetFormData.id ? (res.data as Asset) : item))
          );
          triggerToast(`Asset "${assetFormData.name}" updated successfully!`);
          setIsAssetModalOpen(false);
        } else {
          setFormError(res.error || "Failed to update asset.");
        }
      }
    } catch {
      setFormError("An unexpected server error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-4 right-4 z-50 bg-[#EDF9F1] border border-[#ADE4C1] text-[#00682B] px-4 py-2.5 rounded-nested shadow-lg flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-[#00993F]" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E3E9E5]">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Containers, Machinery & Physical Assets
          </h1>
          <p className="text-xs text-[#4B5563] mt-0.5">
            Standard container models, client-allocated bins, MRF balers, and weighbridges.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {activeTab === "containers" ? (
            <button
              onClick={openAddContainerModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-nested bg-[#00993F] hover:bg-[#008035] text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Container Model</span>
            </button>
          ) : (
            <button
              onClick={openAddAssetModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-nested bg-[#00993F] hover:bg-[#008035] text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register Capital Asset</span>
            </button>
          )}
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Container Stock"
          value={totalFleetStock.toLocaleString()}
          subtitle="All standardized fleet units"
          icon={<Archive className="w-5 h-5 text-[#00993F]" />}
        />
        <StatCard
          title="Deployed at Clients"
          value={totalAllocated.toLocaleString()}
          subtitle="Active on commercial contracts"
          icon={<Layers className="w-5 h-5 text-[#08A6BA]" />}
        />
        <StatCard
          title="Available in Depot"
          value={totalInDepot.toLocaleString()}
          subtitle="Ready for dispatch / replacement"
          icon={<Package className="w-5 h-5 text-[#FECA36]" />}
        />
        <StatCard
          title="Tracked Capital Assets"
          value={assets.length.toString()}
          subtitle="Weighbridges, balers & machinery"
          icon={<Scale className="w-5 h-5 text-emerald-600" />}
        />
      </div>

      {/* Segmented Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-[#E3E9E5] pb-2">
        <button
          onClick={() => setActiveTab("containers")}
          className={`flex items-center gap-2 px-4 py-2 rounded-nested text-xs font-bold transition-all cursor-pointer ${
            activeTab === "containers"
              ? "bg-[#00993F] text-white shadow-xs"
              : "text-[#4B5563] hover:bg-[#F0F4F2]"
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Container Models & Stock ({containerTypes.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("assets")}
          className={`flex items-center gap-2 px-4 py-2 rounded-nested text-xs font-bold transition-all cursor-pointer ${
            activeTab === "assets"
              ? "bg-[#00993F] text-white shadow-xs"
              : "text-[#4B5563] hover:bg-[#F0F4F2]"
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Machinery & Fixed Equipment ({assets.length})</span>
        </button>
      </div>

      {/* TAB 1: CONTAINER TYPES */}
      {activeTab === "containers" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
          {containerTypes.map((c) => {
            const allocated = c.allocatedCount || 0;
            const available = c.availableDepotStock ?? Math.max(0, c.totalStock - allocated);
            const allocationPct = c.totalStock > 0 ? Math.round((allocated / c.totalStock) * 100) : 0;

            return (
              <div
                key={c.code}
                className="bg-white rounded-card p-5 border border-[#E3E9E5] shadow-card-hoverable flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#00993F] bg-[#EDF9F1] px-2.5 py-0.5 rounded-full border border-[#ADE4C1]">
                        {c.code}
                      </span>
                      {c.rfidTracked && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#08A6BA] bg-[#EEFBFD] px-2 py-0.5 rounded-full border border-[#BAEDF4]">
                          <Radio className="w-3 h-3" />
                          RFID Tracked
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Badge variant="neutral">
                        {c.category.replace("_", " ").toUpperCase()}
                      </Badge>
                      <button
                        onClick={() => openEditContainerModal(c)}
                        className="p-1 rounded-md text-slate-400 hover:text-[#00993F] hover:bg-[#EDF9F1] transition-colors cursor-pointer"
                        title="Edit Container Model"
                        aria-label={`Edit ${c.name}`}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base">{c.name}</h3>
                  <p className="text-xs text-[#4B5563] mt-1 line-clamp-2">
                    {c.description || "Heavy-duty standardized collection container deployed across client sites."}
                  </p>

                  <div className="mt-4 p-3 rounded-nested bg-[#F6F8F7] border border-[#E3E9E5] text-xs space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[#4B5563] font-semibold">Nominal Capacity:</span>
                      <span className="font-mono font-bold text-slate-900">
                        {c.capacityLitres.toLocaleString()} Litres
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[#4B5563] font-semibold">Compatible Waste Stream:</span>
                      <span className="font-bold text-[#00682B] bg-[#EDF9F1] px-2 py-0.5 rounded-full text-[11px]">
                        {c.compatibleStream}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-[#E3E9E5] flex justify-between items-center font-mono">
                      <div>
                        <span className="text-[10px] text-[#9CA3AF] block">TOTAL STOCK</span>
                        <span className="font-bold text-slate-900 text-sm">{c.totalStock}</span>
                      </div>
                      <div className="text-center">
                        <span className="text-[10px] text-[#9CA3AF] block">CLIENT ALLOCATED</span>
                        <span className="font-bold text-[#08A6BA] text-sm">{allocated}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-[#9CA3AF] block">IN DEPOT</span>
                        <span className="font-bold text-[#00993F] text-sm">{available}</span>
                      </div>
                    </div>

                    {/* Utilization Bar */}
                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between text-[10px] text-[#9CA3AF]">
                        <span>Client Deployment Rate</span>
                        <span className="font-bold text-slate-700">{allocationPct}%</span>
                      </div>
                      <div className="w-full bg-[#E3E9E5] h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-[#00993F] h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, allocationPct)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: CAPITAL ASSETS (SCALES, BALERS, MACHINERY) */}
      {activeTab === "assets" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {assets.map((a) => (
            <div
              key={a.assetTag}
              className="bg-white rounded-card p-5 border border-[#E3E9E5] shadow-card-hoverable flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-mono text-xs font-bold text-[#00993F] bg-[#EDF9F1] px-2.5 py-0.5 rounded-full border border-[#ADE4C1]">
                    {a.assetTag}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <Badge variant={a.condition === "Excellent" || a.condition === "Good" ? "primary" : "neutral"} dot>
                      {a.condition}
                    </Badge>
                    <button
                      onClick={() => openEditAssetModal(a)}
                      className="p-1 rounded-md text-slate-400 hover:text-[#00993F] hover:bg-[#EDF9F1] transition-colors cursor-pointer"
                      title="Edit Asset"
                      aria-label={`Edit ${a.name}`}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-slate-900 text-sm mt-1">{a.name}</h3>
                <p className="text-xs text-[#4B5563] mt-1">
                  {a.category.replace("_", " ").toUpperCase()} • {a.location}
                </p>

                <div className="mt-4 p-2.5 rounded-nested bg-[#F6F8F7] border border-[#E3E9E5] text-xs">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#4B5563]">Acquisition Cost:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {a.purchaseCost && parseFloat(a.purchaseCost) > 0
                        ? formatCurrency(parseFloat(a.purchaseCost))
                        : "Capital Asset"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#F0F4F2] flex items-center justify-between text-xs text-[#9CA3AF]">
                <span>Registered Asset</span>
                <span className="text-[#00993F] font-semibold">Active Operational Unit</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CONTAINER MODAL */}
      {isContainerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-card max-w-lg w-full p-6 border border-[#E3E9E5] shadow-2xl space-y-4 animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F4F2]">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  {containerModalMode === "add" ? "Add New Container Model" : "Edit Container Model"}
                </h3>
                <p className="text-[11px] text-[#4B5563]">
                  {containerModalMode === "add"
                    ? "Define container type, volumetric capacity, and company total inventory."
                    : `Update specifications and inventory for ${containerFormData.code}.`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => !submitting && setIsContainerModalOpen(false)}
                disabled={submitting}
                className="p-1 rounded-lg hover:bg-slate-100 text-[#9CA3AF] hover:text-slate-700 disabled:opacity-50 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-nested text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleContainerSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Container Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={containerFormData.code}
                    onChange={(e) =>
                      setContainerFormData((prev) => ({
                        ...prev,
                        code: e.target.value.toUpperCase(),
                      }))
                    }
                    placeholder="e.g. BIN-240L"
                    className="w-full text-xs font-mono uppercase p-2.5 rounded-nested border border-[#E3E9E5] bg-white focus:outline-none focus:border-[#00993F]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={containerFormData.category}
                    onChange={(e) =>
                      setContainerFormData((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                    className="w-full text-xs p-2.5 rounded-nested border border-[#E3E9E5] bg-white focus:outline-none focus:border-[#00993F]"
                  >
                    <option value="wheelie_bin">Wheeled Bin</option>
                    <option value="eurobin">Eurobin / Dumpster</option>
                    <option value="skip">Roll-on Industrial Skip</option>
                    <option value="cage">Baling / Wire Cage</option>
                    <option value="drum">Steel / Plastic Drum</option>
                    <option value="custom">Custom Container</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Container Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={containerFormData.name}
                  onChange={(e) =>
                    setContainerFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="e.g. Heavy-Duty 240L Two-Wheeled Bin"
                  className="w-full text-xs p-2.5 rounded-nested border border-[#E3E9E5] bg-white focus:outline-none focus:border-[#00993F]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Capacity (Litres) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={containerFormData.capacityLitres}
                    onChange={(e) =>
                      setContainerFormData((prev) => ({
                        ...prev,
                        capacityLitres: e.target.value,
                      }))
                    }
                    placeholder="e.g. 240"
                    className="w-full text-xs font-mono p-2.5 rounded-nested border border-[#E3E9E5] bg-white focus:outline-none focus:border-[#00993F]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Total Company Stock <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={containerFormData.totalStock}
                    onChange={(e) =>
                      setContainerFormData((prev) => ({
                        ...prev,
                        totalStock: e.target.value,
                      }))
                    }
                    placeholder="e.g. 250"
                    className="w-full text-xs font-mono p-2.5 rounded-nested border border-[#E3E9E5] bg-white focus:outline-none focus:border-[#00993F]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Compatible Waste Stream <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={containerFormData.compatibleStream}
                    onChange={(e) =>
                      setContainerFormData((prev) => ({
                        ...prev,
                        compatibleStream: e.target.value,
                      }))
                    }
                    className="w-full text-xs p-2.5 rounded-nested border border-[#E3E9E5] bg-white focus:outline-none focus:border-[#00993F]"
                  >
                    <option value="All Streams">All Streams</option>
                    <option value="Recyclable">Recyclable (Dry Waste)</option>
                    <option value="Organic">Organic (Food & Kitchen)</option>
                    <option value="Residual">Residual (General Waste)</option>
                    <option value="Hazardous">Hazardous / Regulated</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Color Code</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={containerFormData.colorCode}
                      onChange={(e) =>
                        setContainerFormData((prev) => ({
                          ...prev,
                          colorCode: e.target.value,
                        }))
                      }
                      className="w-8 h-8 rounded border border-[#E3E9E5] cursor-pointer"
                    />
                    <span className="font-mono text-xs">{containerFormData.colorCode}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description / Spec Notes</label>
                <textarea
                  rows={2}
                  value={containerFormData.description}
                  onChange={(e) =>
                    setContainerFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="e.g. UV-stabilised HDPE, DIN EN 840 standard, foot-step pedal"
                  className="w-full text-xs p-2.5 rounded-nested border border-[#E3E9E5] bg-white focus:outline-none focus:border-[#00993F]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="rfidTracked"
                  checked={containerFormData.rfidTracked}
                  onChange={(e) =>
                    setContainerFormData((prev) => ({
                      ...prev,
                      rfidTracked: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 rounded text-[#00993F] focus:ring-[#00993F]"
                />
                <label
                  htmlFor="rfidTracked"
                  className="text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  Fitted with RFID / NFC telemetry tag
                </label>
              </div>

              <div className="sticky -bottom-6 bg-white pt-3 pb-2 border-t border-[#F0F4F2] flex items-center justify-end gap-2.5 -mx-6 px-6 shadow-sm">
                <button
                  type="button"
                  onClick={() => setIsContainerModalOpen(false)}
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-semibold text-[#4B5563] hover:bg-[#F0F4F2] rounded-nested transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#00993F] text-white rounded-nested hover:bg-[#008035] transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>
                      {containerModalMode === "add" ? "Create Model" : "Save Changes"}
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ASSET MODAL */}
      {isAssetModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-card max-w-lg w-full p-6 border border-[#E3E9E5] shadow-2xl space-y-4 animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F4F2]">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  {assetModalMode === "add" ? "Register Capital Asset" : "Edit Asset Details"}
                </h3>
                <p className="text-[11px] text-[#4B5563]">
                  {assetModalMode === "add"
                    ? "Register physical depot machinery, weighbridges, and balers."
                    : `Update asset record for ${assetFormData.assetTag}.`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => !submitting && setIsAssetModalOpen(false)}
                disabled={submitting}
                className="p-1 rounded-lg hover:bg-slate-100 text-[#9CA3AF] hover:text-slate-700 disabled:opacity-50 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-nested text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleAssetSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Asset Tag <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={assetFormData.assetTag}
                    onChange={(e) =>
                      setAssetFormData((prev) => ({
                        ...prev,
                        assetTag: e.target.value.toUpperCase(),
                      }))
                    }
                    placeholder="e.g. SCL-02-WB"
                    className="w-full text-xs font-mono uppercase p-2.5 rounded-nested border border-[#E3E9E5] bg-white focus:outline-none focus:border-[#00993F]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={assetFormData.category}
                    onChange={(e) =>
                      setAssetFormData((prev) => ({
                        ...prev,
                        category: e.target.value as any,
                      }))
                    }
                    className="w-full text-xs p-2.5 rounded-nested border border-[#E3E9E5] bg-white focus:outline-none focus:border-[#00993F]"
                  >
                    <option value="weighbridge_scale">Weighbridge Scale</option>
                    <option value="baling_press">Baling Press</option>
                    <option value="static_compactor">Static Compactor</option>
                    <option value="shredder">Industrial Shredder</option>
                    <option value="wheeled_bin_240l">240L Wheeled Bin Lot</option>
                    <option value="wheeled_bin_1100l">1100L Eurobin Lot</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Asset Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={assetFormData.name}
                  onChange={(e) =>
                    setAssetFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="e.g. Avery Berkel 60t Digital Weighbridge Scale"
                  className="w-full text-xs p-2.5 rounded-nested border border-[#E3E9E5] bg-white focus:outline-none focus:border-[#00993F]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Depot / Site Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={assetFormData.location}
                    onChange={(e) =>
                      setAssetFormData((prev) => ({
                        ...prev,
                        location: e.target.value,
                      }))
                    }
                    placeholder="e.g. Central Depot Ingate / Outgate"
                    className="w-full text-xs p-2.5 rounded-nested border border-[#E3E9E5] bg-white focus:outline-none focus:border-[#00993F]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Condition</label>
                  <select
                    value={assetFormData.condition}
                    onChange={(e) =>
                      setAssetFormData((prev) => ({
                        ...prev,
                        condition: e.target.value as any,
                      }))
                    }
                    className="w-full text-xs p-2.5 rounded-nested border border-[#E3E9E5] bg-white focus:outline-none focus:border-[#00993F]"
                  >
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Damaged">Damaged / Requires Repair</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Purchase / Valuation Cost (KES)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={assetFormData.purchaseCost}
                  onChange={(e) =>
                    setAssetFormData((prev) => ({
                      ...prev,
                      purchaseCost: e.target.value,
                    }))
                  }
                  placeholder="e.g. 1850000"
                  className="w-full text-xs font-mono p-2.5 rounded-nested border border-[#E3E9E5] bg-white focus:outline-none focus:border-[#00993F]"
                />
              </div>

              <div className="sticky -bottom-6 bg-white pt-3 pb-2 border-t border-[#F0F4F2] flex items-center justify-end gap-2.5 -mx-6 px-6 shadow-sm">
                <button
                  type="button"
                  onClick={() => setIsAssetModalOpen(false)}
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-semibold text-[#4B5563] hover:bg-[#F0F4F2] rounded-nested transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#00993F] text-white rounded-nested hover:bg-[#008035] transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>
                      {assetModalMode === "add" ? "Register Asset" : "Save Changes"}
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
