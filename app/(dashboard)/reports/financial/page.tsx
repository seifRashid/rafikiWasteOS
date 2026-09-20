import React from "react";
import { DollarSign, Download, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default function ReportsFinancialPage() {
  const tiers = [
    { tier: "Hotels & Hospitality", billed: 450000, collected: 450000, rate: "100%" },
    { tier: "Commercial & Industrial", billed: 620000, collected: 525000, rate: "84.7%" },
    { tier: "Schools & Educational", billed: 180000, collected: 180000, rate: "100%" },
    { tier: "Residential & Apartments", billed: 290000, collected: 262000, rate: "90.3%" },
    { tier: "Government & Municipal", billed: 320000, collected: 0, rate: "Pending Voucher" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E3E9E5]">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Financial & Billing Performance Reports
          </h1>
          <p className="text-xs text-[#4B5563] mt-0.5">
            Billing collection ratios by customer tier and outstanding receivables reconciliation.
          </p>
        </div>

        <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-nested bg-[#00993F] text-white text-xs font-semibold shadow-sm hover:bg-[#008235]">
          <Download className="w-3.5 h-3.5" />
          <span>Export Financial Audit</span>
        </button>
      </div>

      <div className="bg-white rounded-card border border-[#E3E9E5] shadow-card-elevated overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F6F8F7] border-b border-[#E3E9E5]">
              <tr className="text-[#4B5563] font-semibold">
                <th className="py-3 px-4">Customer Tier</th>
                <th className="py-3 px-4">Total Billed</th>
                <th className="py-3 px-4">Collected (Paid)</th>
                <th className="py-3 px-4">Outstanding (Pending)</th>
                <th className="py-3 px-4 text-right">Collection Efficiency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F4F2]">
              {tiers.map((t, idx) => (
                <tr key={idx} className="hover:bg-[#F6F8F7] transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{t.tier}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    {formatCurrency(t.billed, "KES")}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-[#00993F]">
                    {formatCurrency(t.collected, "KES")}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-amber-700">
                    {formatCurrency(t.billed - t.collected, "KES")}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Badge variant={t.rate === "100%" ? "primary" : "neutral"}>
                      {t.rate}
                    </Badge>
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
