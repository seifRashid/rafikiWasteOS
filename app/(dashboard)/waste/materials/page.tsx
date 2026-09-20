import React from "react";
import { Recycle, DollarSign, Layers, ShieldCheck, Scale } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default function WasteMaterialsPage() {
  const materials = [
    {
      code: "PET-CLR",
      name: "PET Clear Bottles",
      category: "Rigid Plastic",
      benchmarkPrice: 38.5,
      baleDensity: "220 - 250 kg/bale",
      acceptable: "Clear water and beverage bottles, sorted caps",
      rejects: "Opaque bottles, motor oil containers, PVC labels",
    },
    {
      code: "HDP-RGD",
      name: "HDPE Blow Moulding",
      category: "Rigid Plastic",
      benchmarkPrice: 44.0,
      baleDensity: "180 - 220 kg/bale",
      acceptable: "Milk jugs, shampoo/detergent containers, chemical drums",
      rejects: "Heavy grease contamination, PP bucket lids",
    },
    {
      code: "OCC-CRD",
      name: "Cardboard (OCC Bales)",
      category: "Paper & Fibre",
      benchmarkPrice: 14.5,
      baleDensity: "350 - 450 kg/bale",
      acceptable: "Corrugated shipping boxes, clean industrial cartons",
      rejects: "Waxed produce boxes, wet soggy cardboard",
    },
    {
      code: "ALU-UBC",
      name: "Aluminium Beverage Cans",
      category: "Non-Ferrous Metal",
      benchmarkPrice: 165.0,
      baleDensity: "120 - 150 kg briquettes",
      acceptable: "All soda and beverage cans, clean tin-free",
      rejects: "Aerosol cans, steel food cans",
    },
    {
      code: "ORG-CMP",
      name: "Organic Composting Biomass",
      category: "Organic Waste",
      benchmarkPrice: 12.0,
      baleDensity: "Bulk Windrow (kg/m³)",
      acceptable: "Vegetable scraps, fruit rinds, coffee grounds, garden clippings",
      rejects: "Meat/bones (vermin risk), plastic bags, glass shards",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E3E9E5]">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Waste Materials & Grade Specifications
          </h1>
          <p className="text-xs text-[#4B5563] mt-0.5">
            Material classification catalog, baling density benchmarks and scrap pricing matrix.
          </p>
        </div>

        <Badge variant="primary" dot>
          5 Verified Streams
        </Badge>
      </div>

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
                <Badge variant="neutral">{m.category}</Badge>
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
    </div>
  );
}
