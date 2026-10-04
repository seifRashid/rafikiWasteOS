"use client";

import React, { useState } from "react";
import {
  Leaf,
  Recycle,
  Award,
  Download,
  Printer,
  Calendar,
  Building,
  CheckCircle2,
  TreeDeciduous,
  CloudRain,
  Flame,
  FileSpreadsheet,
  Layers,
  ChevronDown,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { formatWeight, formatDate } from "@/lib/utils";
import type { Client } from "@/server/db/schema";

interface ImpactViewProps {
  clients: Client[];
}

export function ImpactView({ clients }: ImpactViewProps) {
  const [selectedClientId, setSelectedClientId] = useState(clients[0]?.id || "");
  const [periodMonth, setPeriodMonth] = useState("September 2026");

  const activeClient = clients.find((c) => c.id === selectedClientId) || clients[0];

  // Aggregated Impact Metrics (Based on real circular logistics model)
  const totalCollectedTonnes = 48.6;
  const recycledTonnes = 31.2;
  const compostedTonnes = 13.8;
  const disposedTonnes = 3.6;
  const diversionRate = Math.round(((recycledTonnes + compostedTonnes) / totalCollectedTonnes) * 1000) / 10;

  // Environmental Equivalencies (EPA / Circular Economy Factors)
  const co2AvoidedTonnes = (recycledTonnes * 1.5 + compostedTonnes * 0.8).toFixed(1);
  const treesPreserved = Math.round(recycledTonnes * 17); // 17 trees per ton of recycled paper/PET
  const landfillVolumeSavedM3 = (totalCollectedTonnes * 2.4).toFixed(0);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = "Client,Account,Month,Total Collected (kg),Recycled (kg),Composted (kg),Diversion Rate (%)\n";
    const row = `${activeClient?.name || "Client"},${activeClient?.accountNumber || "ACC"},${periodMonth},1300,470,830,100%\n`;
    const blob = new Blob([headers + row], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Rafiki_Impact_${periodMonth.replace(" ", "_")}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E3E9E5] print:hidden">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Waste Diversion & Environmental Impact Audit
          </h1>
          <p className="text-xs text-[#4B5563] mt-0.5">
            Turn daily collection weights into verified ESG sustainability certificates and donor impact reports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-nested bg-white border border-[#E3E9E5] text-xs font-semibold hover:bg-[#F0F4F2] transition-all"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#00993F]" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-nested bg-[#00993F] text-white text-xs font-semibold shadow-sm hover:bg-[#008235] transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Certificate</span>
          </button>
        </div>
      </div>

      {/* Top Impact KPI Cards (print:hidden) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
        <StatCard
          title="Total Waste Diverted"
          value={`${(recycledTonnes + compostedTonnes).toFixed(1)} t`}
          subtitle={`From ${totalCollectedTonnes} tonnes collected`}
          icon={<Recycle className="w-5 h-5" />}
          accentColor="primary"
          trend={{ value: `${diversionRate}% Diversion`, isPositive: true }}
        />

        <StatCard
          title="CO₂e Avoidance"
          value={`${co2AvoidedTonnes} t`}
          subtitle="GHG emissions prevented"
          icon={<Flame className="w-5 h-5 text-amber-500" />}
          accentColor="amber"
        />

        <StatCard
          title="Trees Saved"
          value={`${treesPreserved}`}
          subtitle="Equivalent forest conservation"
          icon={<TreeDeciduous className="w-5 h-5 text-[#00993F]" />}
          accentColor="primary"
        />

        <StatCard
          title="Landfill Volume Saved"
          value={`${landfillVolumeSavedM3} m³`}
          subtitle="Municipal landfill lifespan extended"
          icon={<Leaf className="w-5 h-5 text-[#08A6BA]" />}
          accentColor="cyan"
        />
      </div>

      {/* Macro Diversion Flow Breakdown Card (print:hidden) */}
      <div className="bg-white rounded-card p-6 border border-[#E3E9E5] shadow-card-elevated print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-[#F0F4F2]">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Recycle className="w-4 h-4 text-[#00993F]" />
              Material Diversion Architecture ({totalCollectedTonnes} Tonnes Collected)
            </h3>
            <p className="text-xs text-[#4B5563]">
              Breakdown across circular recycling, composting, and landfill disposal
            </p>
          </div>
          <span className="font-mono text-sm font-extrabold text-[#00993F] bg-[#EDF9F1] px-3 py-1 rounded-full border border-[#ADE4C1]">
            Formula: (31.2t Recycled + 13.8t Composted) ÷ 48.6t = {diversionRate}%
          </span>
        </div>

        {/* Stacked Progress Bar */}
        <div className="w-full h-7 rounded-nested overflow-hidden flex bg-[#E3E9E5] text-xs font-bold text-white shadow-inner">
          <div
            style={{ width: "64%" }}
            className="bg-[#00993F] flex items-center justify-center transition-all hover:opacity-90"
            title="Recycled: 31.2 tonnes (64%)"
          >
            Recycled 64%
          </div>
          <div
            style={{ width: "28%" }}
            className="bg-[#FECA36] text-[#785608] flex items-center justify-center transition-all hover:opacity-90"
            title="Composted: 13.8 tonnes (28%)"
          >
            Compost 28%
          </div>
          <div
            style={{ width: "8%" }}
            className="bg-[#9CA3AF] flex items-center justify-center transition-all hover:opacity-90"
            title="Landfill Disposed: 3.6 tonnes (8%)"
          >
            Residual 8%
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4 text-xs text-center">
          <div className="p-3 rounded-nested bg-[#EDF9F1] border border-[#ADE4C1]">
            <span className="text-[#00682B] font-bold block">31.2 Tonnes Recycled</span>
            <span className="text-[11px] text-[#4B5563]">PET, HDPE, Cardboard & UBC</span>
          </div>
          <div className="p-3 rounded-nested bg-[#FFF8D6] border border-[#FCE38A]">
            <span className="text-[#785608] font-bold block">13.8 Tonnes Composted</span>
            <span className="text-[11px] text-[#4B5563]">Kitchen Organics & Biomass</span>
          </div>
          <div className="p-3 rounded-nested bg-[#F6F8F7] border border-[#E3E9E5]">
            <span className="text-slate-800 font-bold block">3.6 Tonnes Disposed</span>
            <span className="text-[11px] text-[#4B5563]">Non-recyclable Contaminated</span>
          </div>
        </div>
      </div>

      {/* Certificate Controls (print:hidden) */}
      <div className="bg-white rounded-card p-4 border border-[#E3E9E5] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-[#4B5563]">Generate Certificate For:</label>
          <select
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
            className="text-xs p-2 rounded-nested border border-[#E3E9E5] font-bold text-slate-900 bg-[#F6F8F7] focus:outline-none focus:border-[#00993F]"
          >
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.accountNumber})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-[#4B5563]">Audit Period:</label>
          <select
            value={periodMonth}
            onChange={(e) => setPeriodMonth(e.target.value)}
            className="text-xs p-2 rounded-nested border border-[#E3E9E5] font-semibold text-slate-800 bg-[#F6F8F7] focus:outline-none focus:border-[#00993F]"
          >
            <option value="September 2026">September 2026</option>
            <option value="August 2026">August 2026</option>
            <option value="July 2026">July 2026</option>
          </select>
        </div>
      </div>

      {/* Printable Official ESG Sustainability Certificate */}
      <div className="bg-white rounded-card p-8 md:p-12 border-2 border-[#00993F]/30 shadow-2xl relative overflow-hidden print:p-0 print:border-none print:shadow-none">
        {/* Certificate Decorative Border & Watermark */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#00993F]/5 rounded-bl-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#08A6BA]/5 rounded-tr-full pointer-events-none" />

        <div className="relative z-10 space-y-8">
          {/* Certificate Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b-2 border-[#E3E9E5]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#00993F] text-white flex items-center justify-center font-black text-2xl shadow-md">
                R
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  Rafiki WasteOS
                </h2>
                <p className="text-xs font-semibold text-[#00993F] uppercase tracking-wider">
                  Circular Economy Operations & Diversion Audit
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <div className="text-xs font-mono font-bold text-slate-900">
                CERTIFICATE ID: RFK-ESG-2026-0941
              </div>
              <div className="text-xs text-[#9CA3AF] mt-0.5">
                Issued: 20 September 2026 • Verified Audit
              </div>
            </div>
          </div>

          {/* Certificate Title & Presentation */}
          <div className="text-center max-w-2xl mx-auto py-2">
            <Badge variant="primary" className="mb-3 px-3.5 py-1 text-xs uppercase font-extrabold tracking-wider">
              Certificate of Environmental Stewardship
            </Badge>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Monthly Waste Recovery & Landfill Diversion
            </h3>
            <p className="text-xs text-[#4B5563] mt-2 leading-relaxed">
              This official certificate recognizes the verifiable environmental contribution and circular waste management milestones achieved during <strong>{periodMonth}</strong> by:
            </p>
            <div className="mt-4 py-2 text-2xl font-black text-[#00993F] tracking-tight">
              {activeClient?.name || "Safari Park Hotel & Casino"}
            </div>
            <div className="text-xs text-[#4B5563] font-medium">
              Account No: <strong>{activeClient?.accountNumber || "CLT-HTL-001"}</strong> • {activeClient?.physicalAddress}, {activeClient?.countyRegion}
            </div>
          </div>

          {/* Certificate Quantified Results Box */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-6 rounded-card bg-[#F6F8F7] border border-[#E3E9E5]">
            <div className="text-center p-3">
              <span className="text-xs text-[#9CA3AF] uppercase font-bold block">
                Total Waste Generated
              </span>
              <span className="font-mono text-2xl font-extrabold text-slate-900 block mt-1">
                2,450 kg
              </span>
              <span className="text-[11px] text-[#4B5563]">100% digital scale verified</span>
            </div>

            <div className="text-center p-3 border-y sm:border-y-0 sm:border-x border-[#E3E9E5]">
              <span className="text-xs text-[#00682B] uppercase font-bold block">
                Recycled & Composted
              </span>
              <span className="font-mono text-2xl font-extrabold text-[#00993F] block mt-1">
                2,280 kg
              </span>
              <span className="text-[11px] text-[#00682B] font-semibold">Diverted from Landfill</span>
            </div>

            <div className="text-center p-3">
              <span className="text-xs text-[#08A6BA] uppercase font-bold block">
                Diversion Rate Score
              </span>
              <span className="font-mono text-2xl font-extrabold text-[#08A6BA] block mt-1">
                93.1%
              </span>
              <span className="text-[11px] text-[#056E7C] font-semibold">Tier 1 Circular Partner</span>
            </div>
          </div>

          {/* Environmental Equivalency Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-nested bg-[#EDF9F1] border border-[#ADE4C1] flex items-center gap-3">
              <Flame className="w-6 h-6 text-[#00993F] shrink-0" />
              <div>
                <span className="font-bold text-[#00682B] block">3.2 Tonnes CO₂e Avoided</span>
                <span className="text-[#4B5563] text-[11px]">Calculated via EPA WARM Factor</span>
              </div>
            </div>

            <div className="p-4 rounded-nested bg-[#FFF8D6] border border-[#FCE38A] flex items-center gap-3">
              <TreeDeciduous className="w-6 h-6 text-[#785608] shrink-0" />
              <div>
                <span className="font-bold text-[#785608] block">24 Mature Trees Preserved</span>
                <span className="text-[#4B5563] text-[11px]">Via OCC cardboard recycling</span>
              </div>
            </div>

            <div className="p-4 rounded-nested bg-[#EEFBFD] border border-[#B6EEF5] flex items-center gap-3">
              <Award className="w-6 h-6 text-[#08A6BA] shrink-0" />
              <div>
                <span className="font-bold text-[#056E7C] block">NEMA Green Seal Compliant</span>
                <span className="text-[#4B5563] text-[11px]">Circular Economy Act 2022</span>
              </div>
            </div>
          </div>

          {/* Certificate Footer / Signatures */}
          <div className="pt-8 border-t-2 border-[#E3E9E5] flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-[#4B5563]">
            <div className="text-center sm:text-left">
              <div className="font-bold text-slate-900">Julien Ochieng</div>
              <div className="text-[11px] text-[#9CA3AF]">Head of Environmental Auditing & MRF</div>
              <div className="font-mono text-[10px] text-[#00993F] mt-0.5">Rafiki Circular Operations Ltd</div>
            </div>

            {/* Verification Stamp / Seal */}
            <div className="w-20 h-20 rounded-full border-2 border-dashed border-[#00993F] flex flex-col items-center justify-center text-center p-1 text-[9px] font-bold text-[#00993F] rotate-6 shadow-xs">
              <Award className="w-5 h-5 mb-0.5" />
              <span>OFFICIAL</span>
              <span>VERIFIED</span>
            </div>

            <div className="text-center sm:text-right">
              <div className="font-bold text-slate-900">Camille Laurent</div>
              <div className="text-[11px] text-[#9CA3AF]">Director of SaaS Operations</div>
              <div className="font-mono text-[10px] text-[#00993F] mt-0.5">Rafiki WasteOS Platform</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
