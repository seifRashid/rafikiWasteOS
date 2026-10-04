import React from "react";
import { getFinanceLedger } from "@/server/db/queries";
import { BarChart3, Download, FolderKanban } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function FinanceReportsPage() {
  const { projects } = await getFinanceLedger();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E3E9E5]">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Financial Statements & Grant Audits
          </h1>
          <p className="text-xs text-[#4B5563] mt-0.5">
            P&L statement summaries, operating margins and donor funding accountability.
          </p>
        </div>

        <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-nested bg-[#00993F] text-white text-xs font-semibold shadow-sm hover:bg-[#008235]">
          <Download className="w-3.5 h-3.5" />
          <span>Export P&L Statement</span>
        </button>
      </div>

      {/* NGO Grant Audits */}
      <div className="space-y-4">
        {projects.map((prj) => (
          <div
            key={prj.id}
            className="p-6 rounded-card bg-white border border-[#E3E9E5] shadow-card-elevated"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#F0F4F2]">
              <div>
                <span className="font-mono text-xs font-bold text-[#00993F] bg-[#EDF9F1] px-2.5 py-0.5 rounded-full border border-[#ADE4C1]">
                  {prj.projectCode}
                </span>
                <h3 className="font-extrabold text-slate-900 text-base mt-2">{prj.name}</h3>
                <p className="text-xs text-[#08A6BA] font-semibold mt-0.5">
                  Partner: {prj.donorPartner}
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs text-[#9CA3AF] block font-medium">Term</span>
                <span className="text-xs font-bold text-slate-800">
                  {formatDate(prj.startDate)} — {formatDate(prj.endDate)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 text-xs">
              <div className="p-3 rounded-nested bg-[#F6F8F7] border border-[#E3E9E5]">
                <span className="text-[#9CA3AF] block">Grant Budget</span>
                <span className="font-mono text-lg font-bold text-slate-900 mt-1 block">
                  {formatCurrency(prj.budgetAmount, "KES")}
                </span>
              </div>
              <div className="p-3 rounded-nested bg-[#EDF9F1] border border-[#ADE4C1]">
                <span className="text-[#00682B] block">Disbursed / Spent</span>
                <span className="font-mono text-lg font-bold text-[#00682B] mt-1 block">
                  {formatCurrency(prj.spentAmount, "KES")}
                </span>
              </div>
              <div className="p-3 rounded-nested bg-[#EEFBFD] border border-[#B6EEF5]">
                <span className="text-[#056E7C] block">Tonnage Recovered</span>
                <span className="font-mono text-lg font-bold text-[#08A6BA] mt-1 block">
                  {prj.recoveredTonnage} t / {prj.targetTonnage} t
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
