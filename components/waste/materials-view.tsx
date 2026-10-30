"use client";

import React, { useState, useEffect } from "react";
import { Plus, Pencil, X, Check, AlertCircle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import type { WasteMaterial } from "@/server/db/schema";
import {
  createMaterialAction,
  updateMaterialAction,
} from "@/server/actions/materials";

interface MaterialsViewProps {
  initialMaterials: WasteMaterial[];
}

interface MaterialFormData {
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

const emptyForm: MaterialFormData = {
  code: "",
  name: "",
  category: "Rigid Plastic",
  wasteStream: "recyclable",
  benchmarkPrice: "",
  baleDensity: "",
  acceptable: "",
  rejects: "",
  isVerified: true,
};

const CATEGORY_SUGGESTIONS = [
  "Rigid Plastic",
  "Film Plastic",
  "Paper & Fibre",
  "Non-Ferrous Metal",
  "Ferrous Metal",
  "Glass",
  "Organic Waste",
  "Electronic Waste",
];

export function MaterialsView({ initialMaterials }: MaterialsViewProps) {
  const [materials, setMaterials] = useState<WasteMaterial[]>(initialMaterials);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [formData, setFormData] = useState<MaterialFormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Sync state if props update from Server Component
  useEffect(() => {
    setMaterials(initialMaterials);
  }, [initialMaterials]);

  const verifiedCount = materials.filter((m) => m.isVerified).length;

  const openAddModal = () => {
    setModalMode("add");
    setFormData(emptyForm);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (material: WasteMaterial) => {
    setModalMode("edit");
    setFormData({
      id: material.id,
      code: material.code,
      name: material.name,
      category: material.category,
      wasteStream: (material.wasteStream as any) || "recyclable",
      benchmarkPrice: material.benchmarkPrice.toString(),
      baleDensity: material.baleDensity,
      acceptable: material.acceptable,
      rejects: material.rejects,
      isVerified: material.isVerified,
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
      setFormError("Benchmark scrap price must be a valid positive number.");
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
          setSuccessToast(`Material "${formData.name}" added successfully!`);
          setIsModalOpen(false);
          setTimeout(() => setSuccessToast(null), 3000);
        } else {
          setFormError(res.error || "Failed to create material.");
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
            prev.map((item) =>
              item.id === formData.id ? (res.data as WasteMaterial) : item
            )
          );
          setSuccessToast(`Material "${formData.name}" updated successfully!`);
          setIsModalOpen(false);
          setTimeout(() => setSuccessToast(null), 3000);
        } else {
          setFormError(res.error || "Failed to update material.");
        }
      }
    } catch {
      setFormError("An unexpected network or server error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-4 right-4 z-50 bg-[#EDF9F1] border border-[#ADE4C1] text-[#00682B] px-4 py-2.5 rounded-nested shadow-lg flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-top-2">
          <Check className="w-4 h-4 text-[#00993F]" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E3E9E5]">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Waste Materials & Grade Specifications
          </h1>
          <p className="text-xs text-[#4B5563] mt-0.5">
            Material classification catalog, baling density benchmarks and scrap pricing matrix.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Badge variant="primary" dot>
            {verifiedCount} Verified Stream{verifiedCount === 1 ? "" : "s"}
          </Badge>

          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-nested bg-[#00993F] hover:bg-[#008035] text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Material</span>
          </button>
        </div>
      </div>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {materials.map((m) => (
          <div
            key={m.code}
            className="bg-white rounded-card p-5 border border-[#E3E9E5] shadow-card-hoverable flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="font-mono text-xs font-bold text-[#00993F] bg-[#EDF9F1] px-2 py-0.5 rounded-full border border-[#ADE4C1]">
                  {m.code}
                </span>

                <div className="flex items-center gap-1.5 flex-wrap justify-end">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-[#ADE4C1] bg-[#EDF9F1] text-[#00682B]">
                    {m.wasteStream || "recyclable"}
                  </span>
                  <Badge variant="neutral">{m.category}</Badge>
                  <button
                    onClick={() => openEditModal(m)}
                    className="p-1 rounded-md text-slate-400 hover:text-[#00993F] hover:bg-[#EDF9F1] transition-colors cursor-pointer"
                    title="Edit Material"
                    aria-label={`Edit ${m.name}`}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h3 className="font-bold text-slate-900 text-base">{m.name}</h3>

              <div className="mt-3 p-2.5 rounded-nested bg-[#F6F8F7] border border-[#E3E9E5] text-xs">
                <div className="flex justify-between font-bold mb-1">
                  <span className="text-[#4B5563]">Benchmark Scrap Rate:</span>
                  <span className="font-mono text-[#00993F]">
                    {formatCurrency(m.benchmarkPrice, "KES")}/kg
                  </span>
                </div>
                <div className="flex justify-between text-[#9CA3AF]">
                  <span>Baling Density:</span>
                  <span className="font-medium text-slate-700">{m.baleDensity}</span>
                </div>
              </div>

              <div className="mt-3 space-y-1.5 text-xs">
                <div>
                  <span className="text-[#00682B] font-bold block">✓ Acceptable:</span>
                  <span className="text-[#4B5563] text-[11px]">{m.acceptable}</span>
                </div>
                <div>
                  <span className="text-red-700 font-bold block">✕ Rejection Criteria:</span>
                  <span className="text-[#4B5563] text-[11px]">{m.rejects}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Material Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-card max-w-lg w-full p-6 border border-[#E3E9E5] shadow-2xl space-y-4 animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F4F2]">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  {modalMode === "add" ? "Add New Material" : "Edit Material Specification"}
                </h3>
                <p className="text-[11px] text-[#4B5563]">
                  {modalMode === "add"
                    ? "Define material code, category, benchmark pricing and sorting standards."
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
                    Material Code <span className="text-red-500">*</span>
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
                    placeholder="e.g. PET-CLR"
                    className="w-full text-xs font-mono uppercase p-2.5 rounded-nested border border-[#E3E9E5] bg-white focus:outline-none focus:border-[#00993F]"
                  />
                  <span className="text-[10px] text-[#9CA3AF]">
                    Unique classification code
                  </span>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    list="category-suggestions"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                    placeholder="e.g. Rigid Plastic"
                    className="w-full text-xs p-2.5 rounded-nested border border-[#E3E9E5] bg-white focus:outline-none focus:border-[#00993F]"
                  />
                  <datalist id="category-suggestions">
                    {CATEGORY_SUGGESTIONS.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
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
                <span className="text-[10px] text-[#9CA3AF]">
                  Maps this material grade to the collection job and reporting waste stream
                </span>
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
                  placeholder="e.g. PET Clear Bottles"
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
                    placeholder="e.g. 38.50"
                    className="w-full text-xs font-mono p-2.5 rounded-nested border border-[#E3E9E5] bg-white focus:outline-none focus:border-[#00993F]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Baling Density Benchmark <span className="text-red-500">*</span>
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
                    placeholder="e.g. 220 - 250 kg/bale"
                    className="w-full text-xs p-2.5 rounded-nested border border-[#E3E9E5] bg-white focus:outline-none focus:border-[#00993F]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#00682B] block mb-1">
                  ✓ Acceptable Specifications <span className="text-red-500">*</span>
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
                  placeholder="e.g. Clear water and beverage bottles, sorted caps"
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
                  placeholder="e.g. Opaque bottles, motor oil containers, PVC labels"
                  className="w-full text-xs p-2.5 rounded-nested border border-[#E3E9E5] bg-white focus:outline-none focus:border-[#00993F]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isVerified"
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
                  htmlFor="isVerified"
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
                    <span>
                      {modalMode === "add" ? "Create Material" : "Save Changes"}
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
