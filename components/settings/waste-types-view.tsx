"use client";

import React, { useState } from "react";
import {
  Recycle,
  Plus,
  Search,
  CheckCircle2,
  X,
  Edit2,
  TrendingUp,
  Sparkles,
  Boxes,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { formatCurrency } from "@/lib/utils";
import type { WasteMaterial } from "@/server/db/schema";
import {
  createMaterialAction,
  updateMaterialAction,
} from "@/server/actions/materials";

interface WasteTypesViewProps {
  initialMaterials: WasteMaterial[];
}

interface FormState {
  id?: string;
  code: string;
  name: string;
  category: string;
  wasteStream: "organic" | "recyclable" | "residual" | "hazardous" | "electronic";
  benchmarkPrice: string;
  baleDensity: string;
  acceptable: string;
  rejects: string;
  isVerified: boolean;
}

const emptyForm: FormState = {
  code: "",
  name: "",
  category: "Plastics",
  wasteStream: "recyclable",
  benchmarkPrice: "25.00",
  baleDensity: "180 - 220 kg/bale",
  acceptable: "Sorted, rinsed, and free of foreign contaminants",
  rejects: "Mixed non-recyclables, motor oils, hazardous residue",
  isVerified: true,
};

export function WasteTypesView({ initialMaterials }: WasteTypesViewProps) {
  const [materials, setMaterials] = useState<WasteMaterial[]>(initialMaterials);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [streamFilter, setStreamFilter] = useState("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [formData, setFormData] = useState<FormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Derived metrics
  const activeCount = materials.length;
  const verifiedCount = materials.filter((m) => m.isVerified).length;
  const organicCount = materials.filter((m) => m.wasteStream === "organic").length;
  const residualCount = materials.filter((m) => m.wasteStream === "residual").length;

  const highestPriceMaterial = materials.reduce<WasteMaterial | null>((highest, curr) => {
    const currPrice = parseFloat(curr.benchmarkPrice.toString());
    if (!highest) return curr;
    const highestPrice = parseFloat(highest.benchmarkPrice.toString());
    return currPrice > highestPrice ? curr : highest;
  }, null);

  const categories = Array.from(new Set(materials.map((m) => m.category))).filter(Boolean);

  const filteredMaterials = materials.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || m.category === categoryFilter;
    const matchesStream = streamFilter === "all" || m.wasteStream === streamFilter;
    return matchesSearch && matchesCategory && matchesStream;
  });

  const openAddModal = () => {
    setModalMode("add");
    setFormData(emptyForm);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: WasteMaterial) => {
    setModalMode("edit");
    setFormData({
      id: item.id,
      code: item.code,
      name: item.name,
      category: item.category,
      wasteStream: (item.wasteStream as any) || "recyclable",
      benchmarkPrice: item.benchmarkPrice.toString(),
      baleDensity: item.baleDensity,
      acceptable: item.acceptable,
      rejects: item.rejects,
      isVerified: item.isVerified,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (submitting) return;
    setIsModalOpen(false);
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);

    const priceNum = parseFloat(formData.benchmarkPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setFormError("Benchmark price must be a valid positive number.");
      setSubmitting(false);
      return;
    }

    try {
      if (modalMode === "add") {
        const res = await createMaterialAction({
          code: formData.code,
          name: formData.name,
          category: formData.category,
          wasteStream: formData.wasteStream,
          benchmarkPrice: priceNum,
          baleDensity: formData.baleDensity,
          acceptable: formData.acceptable,
          rejects: formData.rejects,
          isVerified: formData.isVerified,
        });

        if (res.success && res.data) {
          setMaterials((prev) => [...prev, res.data as WasteMaterial]);
          setSuccessToast(`Material stream "${formData.name}" created successfully!`);
          setIsModalOpen(false);
          setTimeout(() => setSuccessToast(null), 3000);
        } else {
          setFormError(res.error || "Failed to create material stream.");
        }
      } else {
        if (!formData.id) {
          setFormError("Missing material identifier.");
          setSubmitting(false);
          return;
        }

        const res = await updateMaterialAction({
          id: formData.id,
          code: formData.code,
          name: formData.name,
          category: formData.category,
          wasteStream: formData.wasteStream,
          benchmarkPrice: priceNum,
          baleDensity: formData.baleDensity,
          acceptable: formData.acceptable,
          rejects: formData.rejects,
          isVerified: formData.isVerified,
        });

        if (res.success && res.data) {
          setMaterials((prev) =>
            prev.map((item) => (item.id === formData.id ? (res.data as WasteMaterial) : item))
          );
          setSuccessToast(`Material stream "${formData.name}" updated successfully!`);
          setIsModalOpen(false);
          setTimeout(() => setSuccessToast(null), 3000);
        } else {
          setFormError(res.error || "Failed to update material stream.");
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

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Configured Streams"
          value={activeCount.toString()}
          subtitle={`${verifiedCount} verified industry standards`}
          icon={<Recycle className="w-5 h-5 text-[#00993F]" />}
        />
        <StatCard
          title="Highest Scrap Value"
          value={
            highestPriceMaterial
              ? `${formatCurrency(parseFloat(highestPriceMaterial.benchmarkPrice.toString()))}/kg`
              : "N/A"
          }
          subtitle={highestPriceMaterial ? highestPriceMaterial.name : "No scrap rates"}
          icon={<TrendingUp className="w-5 h-5 text-emerald-600" />}
        />
        <StatCard
          title="Organic Streams"
          value={`${organicCount} Streams`}
          subtitle="Composting & bio-conversion"
          icon={<Sparkles className="w-5 h-5 text-[#FECA36]" />}
        />
        <StatCard
          title="Residual Streams"
          value={`${residualCount} Streams`}
          subtitle="Landfill diversion minimization"
          icon={<Boxes className="w-5 h-5 text-[#08A6BA]" />}
        />
      </div>

      {/* Search & Action Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-card border border-[#E3E9E5] shadow-xs">
        <div className="flex flex-1 flex-wrap items-center gap-2.5">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Search by stream name or code (e.g. PET, HDPE, ALU)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-[#F6F8F7] border border-[#E3E9E5] rounded-nested focus:outline-none focus:ring-1 focus:ring-[#00993F] focus:border-[#00993F]"
            />
          </div>

          <select
            value={streamFilter}
            onChange={(e) => setStreamFilter(e.target.value)}
            className="text-xs bg-[#F6F8F7] border border-[#E3E9E5] rounded-nested px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#00993F]"
          >
            <option value="all">All Waste Streams</option>
            <option value="recyclable">Recyclable</option>
            <option value="organic">Organic</option>
            <option value="residual">Residual</option>
            <option value="hazardous">Hazardous</option>
            <option value="electronic">Electronic</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs bg-[#F6F8F7] border border-[#E3E9E5] rounded-nested px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#00993F]"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#00993F] text-white text-xs font-bold rounded-nested hover:bg-[#008035] transition-all shadow-xs shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Material Stream</span>
        </button>
      </div>

      {/* Streams Table */}
      <div className="bg-white rounded-card border border-[#E3E9E5] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F6F8F7] border-b border-[#E3E9E5] text-[11px] text-[#4B5563] uppercase font-bold tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Code & Material Name</th>
                <th className="px-4 py-3.5">Waste Stream</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5">Benchmark Scrap (KES/kg)</th>
                <th className="px-4 py-3.5">Baling / Bulk Density</th>
                <th className="px-4 py-3.5">Verification</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3E9E5]">
              {filteredMaterials.map((m) => (
                <tr key={m.id} className="hover:bg-[#F6F8F7]/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-bold text-[#00993F] bg-[#EDF9F1] px-2 py-0.5 rounded-full border border-[#ADE4C1] shrink-0">
                        {m.code}
                      </span>
                      <div>
                        <div className="font-bold text-slate-900 text-xs">{m.name}</div>
                        <div className="text-[11px] text-[#9CA3AF] line-clamp-1">{m.acceptable}</div>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-[#ADE4C1] bg-[#EDF9F1] text-[#00682B]">
                      {m.wasteStream || "recyclable"}
                    </span>
                  </td>

                  <td className="px-4 py-3.5">
                    <Badge variant="neutral">{m.category}</Badge>
                  </td>

                  <td className="px-4 py-3.5">
                    <div className="font-mono font-bold text-slate-900 text-xs">
                      {formatCurrency(parseFloat(m.benchmarkPrice.toString()))}/kg
                    </div>
                  </td>

                  <td className="px-4 py-3.5">
                    <span className="text-slate-600 font-medium">{m.baleDensity}</span>
                  </td>

                  <td className="px-4 py-3.5">
                    <Badge variant={m.isVerified ? "primary" : "neutral"} dot={m.isVerified}>
                      {m.isVerified ? "Verified" : "Custom"}
                    </Badge>
                  </td>

                  <td className="px-4 py-3.5 text-right">
                    <button
                      onClick={() => openEditModal(m)}
                      className="p-1.5 text-slate-400 hover:text-[#00993F] hover:bg-[#EDF9F1] rounded-md transition-colors cursor-pointer"
                      title="Edit Material"
                      aria-label={`Edit ${m.name}`}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredMaterials.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-500">
                    No material streams found matching your search and filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-card max-w-lg w-full p-6 border border-[#E3E9E5] shadow-2xl space-y-4 animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F4F2]">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  {modalMode === "add" ? "Add Material Stream" : "Edit Material Stream"}
                </h3>
                <p className="text-[11px] text-[#4B5563]">
                  {modalMode === "add"
                    ? "Configure classification, benchmark scrap rate, and operational stream."
                    : `Update specifications and pricing benchmark for ${formData.code}.`}
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                disabled={submitting}
                className="p-1 rounded-lg hover:bg-slate-100 text-[#9CA3AF] hover:text-slate-700 disabled:opacity-50 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error Message */}
            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-nested text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{formError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Stream Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        code: e.target.value.toUpperCase(),
                      }))
                    }
                    placeholder="e.g. PP-WVN"
                    className="w-full text-xs font-mono uppercase p-2.5 rounded-nested border border-[#E3E9E5] bg-white focus:outline-none focus:border-[#00993F]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                    placeholder="e.g. Rigid Plastics"
                    className="w-full text-xs p-2.5 rounded-nested border border-[#E3E9E5] bg-white focus:outline-none focus:border-[#00993F]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Operational Waste Stream <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.wasteStream}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      wasteStream: e.target.value as any,
                    }))
                  }
                  className="w-full text-xs p-2.5 rounded-nested border border-[#E3E9E5] bg-white focus:outline-none focus:border-[#00993F]"
                >
                  <option value="recyclable">Recyclable (Dry recoverable commodities)</option>
                  <option value="organic">Organic (Food & green biomass)</option>
                  <option value="residual">Residual (Non-recyclable general waste)</option>
                  <option value="hazardous">Hazardous (Special handling / regulated)</option>
                  <option value="electronic">Electronic (WEEE / e-waste)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Material Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="e.g. Polypropylene Woven Sacks & Bags"
                  className="w-full text-xs p-2.5 rounded-nested border border-[#E3E9E5] bg-white focus:outline-none focus:border-[#00993F]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Benchmark Scrap Rate (KES/kg) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={formData.benchmarkPrice}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        benchmarkPrice: e.target.value,
                      }))
                    }
                    placeholder="e.g. 24.50"
                    className="w-full text-xs font-mono p-2.5 rounded-nested border border-[#E3E9E5] bg-white focus:outline-none focus:border-[#00993F]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Baling / Bulk Density <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.baleDensity}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        baleDensity: e.target.value,
                      }))
                    }
                    placeholder="e.g. 180 - 220 kg/bale"
                    className="w-full text-xs p-2.5 rounded-nested border border-[#E3E9E5] bg-white focus:outline-none focus:border-[#00993F]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#00682B] block mb-1">
                  ✓ Acceptable Criteria <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={formData.acceptable}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      acceptable: e.target.value,
                    }))
                  }
                  placeholder="e.g. Clean dry woven sacks, free of cement or chemical cakes"
                  className="w-full text-xs p-2.5 rounded-nested border border-[#E3E9E5] bg-white focus:outline-none focus:border-[#00993F]"
                />
              </div>

              <div>
                <label className="font-bold text-red-700 block mb-1">
                  ✕ Rejection Criteria <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={formData.rejects}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      rejects: e.target.value,
                    }))
                  }
                  placeholder="e.g. Multi-layer laminate sacks, hazardous chemical residues"
                  className="w-full text-xs p-2.5 rounded-nested border border-[#E3E9E5] bg-white focus:outline-none focus:border-[#00993F]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="settingsIsVerified"
                  checked={formData.isVerified}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      isVerified: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 rounded text-[#00993F] focus:ring-[#00993F]"
                />
                <label
                  htmlFor="settingsIsVerified"
                  className="text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  Verified Waste Stream (included in certified stream counts)
                </label>
              </div>

              {/* Modal Actions */}
              <div className="sticky -bottom-6 bg-white pt-3 pb-2 border-t border-[#F0F4F2] flex items-center justify-end gap-2.5 -mx-6 px-6 shadow-sm">
                <button
                  type="button"
                  onClick={closeModal}
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
                    <span>{modalMode === "add" ? "Create Stream" : "Save Changes"}</span>
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
