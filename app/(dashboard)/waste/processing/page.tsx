import React from "react";
import { Layers, AlertTriangle, CheckCircle2, RotateCw, Warehouse } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatWeight } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default function WasteProcessingPage() {
  const operations = [
    {
      shift: "Shift A (Morning)",
      conveyor: "Conveyor Line 01 - Optical/Manual PET Sorting",
      inflowKg: 4500,
      sortedRecoveredKg: 4100,
      shrinkageRejectsKg: 400,
      shrinkageRate: "8.9%",
      status: "completed",
    },
    {
      shift: "Shift B (Afternoon)",
      conveyor: "Baler Press Bramidan B20 - Cardboard OCC",
      inflowKg: 6200,
      sortedRecoveredKg: 5950,
      shrinkageRejectsKg: 250,
      shrinkageRate: "4.0%",
      status: "completed",
    },
    {
      shift: "Composting Yard",
      conveyor: "Windrow 03 - Organic Waste Turner",
      inflowKg: 18500,
      sortedRecoveredKg: 16800,
      shrinkageRejectsKg: 1700,
      shrinkageRate: "9.2%",
      status: "active",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E3E9E5]">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Material Processing & Sorting Shrinkage
          </h1>
          <p className="text-xs text-[#4B5563] mt-0.5">
            Conveyor sortation yields, vertical baling press logs, and contamination audit.
          </p>
        </div>

        <Badge variant="primary" dot>
          Depot Processing Active
        </Badge>
      </div>

      <div className="space-y-4">
        {operations.map((op, idx) => (
          <div
            key={idx}
            className="p-5 rounded-card bg-white border border-[#E3E9E5] shadow-card-elevated"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#F0F4F2]">
              <div>
                <span className="text-xs font-bold text-[#00993F] uppercase tracking-wider block">
                  {op.shift}
                </span>
                <h3 className="font-bold text-slate-900 text-sm mt-0.5">{op.conveyor}</h3>
              </div>

              <Badge variant={op.status === "completed" ? "primary" : "cyan"} dot>
                {op.status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 text-xs">
              <div className="p-3 rounded-nested bg-[#F6F8F7] border border-[#E3E9E5]">
                <span className="text-[#9CA3AF] block font-medium">Inflow Intake</span>
                <span className="font-mono text-base font-bold text-slate-900 block mt-0.5">
                  {formatWeight(op.inflowKg, "kg")}
                </span>
              </div>

              <div className="p-3 rounded-nested bg-[#EDF9F1] border border-[#ADE4C1]">
                <span className="text-[#00682B] block font-medium">Recovered Clean Yield</span>
                <span className="font-mono text-base font-bold text-[#00682B] block mt-0.5">
                  {formatWeight(op.sortedRecoveredKg, "kg")}
                </span>
              </div>

              <div className="p-3 rounded-nested bg-[#FFF8D6] border border-[#FCE38A]">
                <span className="text-[#785608] block font-medium">Contamination Rejects</span>
                <span className="font-mono text-base font-bold text-[#785608] block mt-0.5">
                  -{formatWeight(op.shrinkageRejectsKg, "kg")}
                </span>
              </div>

              <div className="p-3 rounded-nested bg-[#F6F8F7] border border-[#E3E9E5]">
                <span className="text-[#9CA3AF] block font-medium">Shrinkage Rate</span>
                <span className="font-mono text-base font-bold text-slate-800 block mt-0.5">
                  {op.shrinkageRate}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
