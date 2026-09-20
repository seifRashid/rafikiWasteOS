import React from "react";
import { Recycle, Download, Scale } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatWeight } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default function ReportsWastePage() {
  const streamData = [
    { stream: "PET Plastic Bottles (Clear/Amber)", collectedKg: 4500, recoveredKg: 4100, rate: "91.1%" },
    { stream: "HDPE Rigid Containers & Drums", collectedKg: 2800, recoveredKg: 2650, rate: "94.6%" },
    { stream: "Cardboard Packaging (OCC)", collectedKg: 6200, recoveredKg: 5950, rate: "95.9%" },
    { stream: "Aluminium Beverage Cans (UBC)", collectedKg: 950, recoveredKg: 920, rate: "96.8%" },
    { stream: "Organic Kitchen Waste (Composted)", collectedKg: 18500, recoveredKg: 16800, rate: "90.8%" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E3E9E5]">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Waste Recovery & Stream Analytics
          </h1>
          <p className="text-xs text-[#4B5563] mt-0.5">
            Total kilograms collected vs recovered by waste stream with sortation yield percentages.
          </p>
        </div>

        <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-nested bg-[#00993F] text-white text-xs font-semibold shadow-sm hover:bg-[#008235]">
          <Download className="w-3.5 h-3.5" />
          <span>Export Waste Stream Report</span>
        </button>
      </div>

      <div className="bg-white rounded-card border border-[#E3E9E5] shadow-card-elevated overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F6F8F7] border-b border-[#E3E9E5]">
              <tr className="text-[#4B5563] font-semibold">
                <th className="py-3 px-4">Waste Stream</th>
                <th className="py-3 px-4">Total Intake (kg)</th>
                <th className="py-3 px-4">Recovered Clean (kg)</th>
                <th className="py-3 px-4">Sorting Rejects</th>
                <th className="py-3 px-4 text-right">Recovery Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F4F2]">
              {streamData.map((row, idx) => (
                <tr key={idx} className="hover:bg-[#F6F8F7] transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{row.stream}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-700">
                    {formatWeight(row.collectedKg, "kg")}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-[#00993F]">
                    {formatWeight(row.recoveredKg, "kg")}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-amber-700">
                    -{formatWeight(row.collectedKg - row.recoveredKg, "kg")}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Badge variant="primary">{row.rate}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
