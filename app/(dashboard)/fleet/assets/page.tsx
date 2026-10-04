import React from "react";
import { Package, Scale, Plus, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default function FleetAssetsPage() {
  const assets = [
    {
      tag: "SCL-01-WB",
      name: "Avery Berkel 60t Digital Weighbridge Scale",
      type: "Weighing Scale",
      location: "Central Depot Ingate / Outgate",
      condition: "Excellent (KEBS Calibrated)",
      status: "operational",
    },
    {
      tag: "BAL-B20-04",
      name: "Bramidan B20 Vertical Baler Press",
      type: "Material Compactor",
      location: "MRF Shed Bay 01",
      condition: "Good",
      status: "operational",
    },
    {
      tag: "BIN-LOT-240",
      name: "182 x Heavy-Duty Wheeled Bins (240L)",
      type: "Customer Containers",
      location: "Deployed at Client Sites & Yards",
      condition: "Good",
      status: "assigned",
    },
    {
      tag: "SKP-1100-08",
      name: "12 x Heavy Steel Skip Bins (1100L)",
      type: "Industrial Skips",
      location: "Industrial Area & Brewery Lots",
      condition: "Fair",
      status: "assigned",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E3E9E5]">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Containers, Machinery & Physical Assets
          </h1>
          <p className="text-xs text-[#4B5563] mt-0.5">
            RFID tagged wheeled bins, industrial skips, baling machinery, and IP weighbridge scales.
          </p>
        </div>

        <button className="flex items-center gap-1.5 px-4 py-2 rounded-nested bg-[#00993F] text-white text-xs font-semibold shadow-sm hover:bg-[#008235]">
          <Plus className="w-4 h-4" />
          <span>Register Physical Asset</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {assets.map((a) => (
          <div
            key={a.tag}
            className="p-5 rounded-card bg-white border border-[#E3E9E5] shadow-card-hoverable flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="font-mono text-xs font-bold text-[#00993F] bg-[#EDF9F1] px-2 py-0.5 rounded-full border border-[#ADE4C1]">
                  {a.tag}
                </span>
                <Badge variant={a.status === "operational" ? "primary" : "neutral"} dot>
                  {a.status}
                </Badge>
              </div>

              <h3 className="font-bold text-slate-900 text-sm mt-1">{a.name}</h3>
              <p className="text-xs text-[#4B5563] mt-1">{a.type} • {a.location}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-[#F0F4F2] flex items-center justify-between text-xs text-[#9CA3AF]">
              <span>Condition: <strong className="text-slate-700">{a.condition}</strong></span>
              <span className="text-[#00993F] font-semibold">Tracked Asset</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
