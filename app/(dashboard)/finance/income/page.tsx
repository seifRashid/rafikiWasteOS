import React from "react";
import { DollarSign, TrendingUp, Layers, Building } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default function FinanceIncomePage() {
  const streams = [
    {
      source: "Monthly Client Collection Service Fees",
      category: "Contract Subscriptions",
      amount: 1425000,
      share: "68%",
      color: "bg-[#00993F]",
    },
    {
      source: "Recyclable Scrap Sales (PET, OCC, Metals)",
      category: "Commodity Offtake",
      amount: 415000,
      share: "20%",
      color: "bg-[#08A6BA]",
    },
    {
      source: "NGO Donor Environmental Grant Tranches",
      category: "Donor Funding",
      amount: 250000,
      share: "12%",
      color: "bg-[#FECA36]",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E3E9E5]">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Revenue & Income Streams
          </h1>
          <p className="text-xs text-[#4B5563] mt-0.5">
            Breakdown across contracted collection fees, recyclable scrap sales and project grants.
          </p>
        </div>

        <Badge variant="primary" dot>
          Diversified Revenue Base
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {streams.map((s, idx) => (
          <div
            key={idx}
            className="p-5 rounded-card bg-white border border-[#E3E9E5] shadow-card-hoverable"
          >
            <span className="text-xs font-bold text-[#00993F] uppercase tracking-wider block">
              {s.category}
            </span>
            <h3 className="font-bold text-slate-900 text-sm mt-1">{s.source}</h3>
            <div className="font-mono text-2xl font-extrabold text-slate-900 mt-3">
              {formatCurrency(s.amount, "KES")}
            </div>
            <div className="mt-3 w-full bg-[#E3E9E5] h-2 rounded-full overflow-hidden">
              <div className={`${s.color} h-full rounded-full`} style={{ width: s.share }} />
            </div>
            <span className="text-[11px] text-[#9CA3AF] mt-1 block">
              Contributes {s.share} of total company inflow
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
