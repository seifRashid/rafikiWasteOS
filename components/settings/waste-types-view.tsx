"use client";

import React, { useState } from "react";
import {
  Recycle,
  Plus,
  Search,
  Filter,
  Check,
  Edit2,
  Trash2,
  Scale,
  Sparkles,
  TrendingUp,
  Boxes,
  CheckCircle2,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { formatCurrency } from "@/lib/utils";

interface WasteStreamItem {
  id: string;
  code: string;
  name: string;
  category: "Plastics" | "Paper & Board" | "Glass" | "Metals" | "Organics" | "Residual";
  color: string;
  scrapRatePerKg: number;
  bulkDensityKgM3: number;
  diversionTargetPercent: number;
  processingProtocol: string;
  status: "active" | "seasonal" | "restricted";
}

const initialStreams: WasteStreamItem[] = [
  {
    id: "ws-01",
    code: "PET-CLR",
    name: "PET Clear Bottles (Mineral Water & Soda)",
    category: "Plastics",
    color: "#08A6BA",
    scrapRatePerKg: 28.0,
    bulkDensityKgM3: 35,
    diversionTargetPercent: 95,
    processingProtocol: "Baled & Strapped (250kg bales)",
    status: "active",
  },
  {
    id: "ws-02",
    code: "HDPE-BLW",
    name: "HDPE Blow (Milk Bottles, Jerrycans, Detergent)",
    category: "Plastics",
    color: "#00993F",
    scrapRatePerKg: 35.0,
    bulkDensityKgM3: 40,
    diversionTargetPercent: 92,
    processingProtocol: "Flaked or Baled",
    status: "active",
  },
  {
    id: "ws-03",
    code: "OCC-CRD",
    name: "OCC Corrugated Cardboard Boxes",
    category: "Paper & Board",
    color: "#B45309",
    scrapRatePerKg: 12.5,
    bulkDensityKgM3: 65,
    diversionTargetPercent: 90,
    processingProtocol: "High-density Hydraulic Baling",
    status: "active",
  },
  {
    id: "ws-04",
    code: "LDPE-FLM",
    name: "LDPE Film & Stretch Wrap",
    category: "Plastics",
    color: "#3B82F6",
    scrapRatePerKg: 22.0,
    bulkDensityKgM3: 25,
    diversionTargetPercent: 80,
    processingProtocol: "Agglomerated / Extruded Pellets",
    status: "active",
  },
  {
    id: "ws-05",
    code: "ORG-KTN",
    name: "Commercial Kitchen & Organic Scraps",
    category: "Organics",
    color: "#15803D",
    scrapRatePerKg: 4.5,
    bulkDensityKgM3: 500,
    diversionTargetPercent: 98,
    processingProtocol: "Windrow Composting / Black Soldier Fly",
    status: "active",
  },
  {
    id: "ws-06",
    code: "GLS-CLR",
    name: "Clear Flint Glass Bottles",
    category: "Glass",
    color: "#0284C7",
    scrapRatePerKg: 8.0,
    bulkDensityKgM3: 450,
    diversionTargetPercent: 88,
    processingProtocol: "Cullet Crushed & Shipped to Smelter",
    status: "active",
  },
  {
    id: "ws-07",
    code: "MTL-ALU",
    name: "Aluminium Beverage Cans (UBC)",
    category: "Metals",
    color: "#64748B",
    scrapRatePerKg: 140.0,
    bulkDensityKgM3: 75,
    diversionTargetPercent: 99,
    processingProtocol: "Compacted Briquettes for Foundry",
    status: "active",
  },
  {
    id: "ws-08",
    code: "RES-LAND",
    name: "Non-Recyclable Residual Waste",
    category: "Residual",
    color: "#6B7280",
    scrapRatePerKg: 0.0,
    bulkDensityKgM3: 280,
    diversionTargetPercent: 0,
    processingProtocol: "Municipal Engineered Landfill",
    status: "restricted",
  },
];

export function WasteTypesView() {
  const [streams, setStreams] = useState<WasteStreamItem[]>(initialStreams);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [form, setForm] = useState({
    code: "",
    name: "",
    category: "Plastics" as WasteStreamItem["category"],
    color: "#08A6BA",
    scrapRatePerKg: 25.0,
    bulkDensityKgM3: 50,
    diversionTargetPercent: 90,
    processingProtocol: "Baled & Weighed",
  });

  const filteredStreams = streams.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || s.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleAddStream = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.code) return;

    const newItem: WasteStreamItem = {
      id: "ws-" + Date.now().toString().slice(-4),
      code: form.code.toUpperCase(),
      name: form.name,
      category: form.category,
      color: form.color,
      scrapRatePerKg: Number(form.scrapRatePerKg),
      bulkDensityKgM3: Number(form.bulkDensityKgM3),
      diversionTargetPercent: Number(form.diversionTargetPercent),
      processingProtocol: form.processingProtocol,
      status: "active",
    };

    setStreams([...streams, newItem]);
    setIsCreateModalOpen(false);
    setSuccessMessage(`Added waste stream "${newItem.name}" (${newItem.code})`);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  return (
    <div className="space-y-6">
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-sm font-semibold">{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-500 hover:text-emerald-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Waste Streams"
          value={streams.filter((s) => s.status === "active").length.toString()}
          subtitle="Segregated collection streams"
          icon={<Recycle className="w-5 h-5 text-primary" />}
        />
        <StatCard
          title="Highest Offtake Value"
          value="KES 140 / kg"
          subtitle="Aluminium Beverage Cans (UBC)"
          icon={<TrendingUp className="w-5 h-5 text-emerald-600" />}
        />
        <StatCard
          title="Average Circular Target"
          value="89.5%"
          subtitle="Target diversion across dry fractions"
          icon={<Sparkles className="w-5 h-5 text-[#08A6BA]" />}
        />
        <StatCard
          title="Residual Fractions"
          value="1 Stream"
          subtitle="Landfill diversion minimization"
          icon={<Boxes className="w-5 h-5 text-muted-foreground" />}
        />
      </div>

      {/* Search & Action Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-border shadow-xs">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by stream name or code (e.g. PET, HDPE)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-muted/40 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs sm:text-sm bg-muted/40 border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All Categories</option>
            <option value="Plastics">Plastics</option>
            <option value="Paper & Board">Paper & Board</option>
            <option value="Glass">Glass</option>
            <option value="Metals">Metals</option>
            <option value="Organics">Organics</option>
            <option value="Residual">Residual</option>
          </select>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-all shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Material Stream
        </button>
      </div>

      {/* Streams Table */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/30 border-b border-border text-xs text-muted-foreground uppercase font-semibold">
              <tr>
                <th className="px-5 py-3.5">Material Stream & Code</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5">Scrap Benchmark (KES/kg)</th>
                <th className="px-4 py-3.5">Bulk Density</th>
                <th className="px-4 py-3.5">Diversion Target</th>
                <th className="px-4 py-3.5">Processing Protocol</th>
                <th className="px-4 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredStreams.map((stream) => (
                <tr key={stream.id} className="hover:bg-muted/10 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span
                        className="w-3.5 h-3.5 rounded-md shrink-0"
                        style={{ backgroundColor: stream.color }}
                      />
                      <div>
                        <div className="font-bold text-foreground text-sm">{stream.name}</div>
                        <span className="font-mono text-xs font-semibold text-primary">{stream.code}</span>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      {stream.category}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    <div className="font-mono font-bold text-foreground text-sm">
                      {stream.scrapRatePerKg > 0 ? formatCurrency(stream.scrapRatePerKg) : "Free / Fee-based"}
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <span className="font-mono text-xs text-muted-foreground">
                      {stream.bulkDensityKgM3} kg/m³
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${stream.diversionTargetPercent}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono font-bold text-foreground">
                        {stream.diversionTargetPercent}%
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <span className="text-xs text-muted-foreground">{stream.processingProtocol}</span>
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                        stream.status === "active"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {stream.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-border shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-border bg-muted/20">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Recycle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground">Configure Material Stream</h3>
                  <p className="text-xs text-muted-foreground">Define waste classification & scrap pricing benchmark</p>
                </div>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="p-1 text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStream} className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground uppercase mb-1">Stream Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PP-WVN"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    className="w-full text-sm font-mono px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground uppercase mb-1">Category *</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                    className="w-full text-sm px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="Plastics">Plastics</option>
                    <option value="Paper & Board">Paper & Board</option>
                    <option value="Glass">Glass</option>
                    <option value="Metals">Metals</option>
                    <option value="Organics">Organics</option>
                    <option value="Residual">Residual</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground uppercase mb-1">Material Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Polypropylene Woven Sacks & Bags"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full text-sm px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground uppercase mb-1">Scrap Price (KES/kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={form.scrapRatePerKg}
                    onChange={(e) => setForm({ ...form, scrapRatePerKg: Number(e.target.value) })}
                    className="w-full text-sm font-mono px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground uppercase mb-1">Density (kg/m³)</label>
                  <input
                    type="number"
                    value={form.bulkDensityKgM3}
                    onChange={(e) => setForm({ ...form, bulkDensityKgM3: Number(e.target.value) })}
                    className="w-full text-sm font-mono px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground uppercase mb-1">Diversion Target %</label>
                  <input
                    type="number"
                    max="100"
                    min="0"
                    value={form.diversionTargetPercent}
                    onChange={(e) => setForm({ ...form, diversionTargetPercent: Number(e.target.value) })}
                    className="w-full text-sm font-mono px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground uppercase mb-1">Processing Protocol</label>
                <input
                  type="text"
                  placeholder="e.g. Cleaned & Baled"
                  value={form.processingProtocol}
                  onChange={(e) => setForm({ ...form, processingProtocol: e.target.value })}
                  className="w-full text-sm px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 shadow-xs"
                >
                  Save Stream
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
