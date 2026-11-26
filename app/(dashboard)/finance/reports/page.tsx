import React from "react";
import { getFinanceLedger } from "@/server/db/queries";
import { BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function FinanceReportsPage() {
  const { invoices, expenses, projects, scrapSales } = await getFinanceLedger();

  const invoiceRevenue = invoices
    .filter((i) => i.invoice.status === "paid")
    .reduce((sum, i) => sum + parseFloat(i.invoice.amount || "0"), 0);

  const scrapRevenue = scrapSales.reduce(
    (sum, b) => sum + parseFloat(b.totalRevenue || "0"),
    0
  );

  const totalRevenue = invoiceRevenue + scrapRevenue;

  const totalExpenses = expenses.reduce(
    (sum, e) => sum + parseFloat(e.expense.amount || "0"),
    0
  );

  const netOperatingProfit = totalRevenue - totalExpenses;
  const operatingMarginPct =
    totalRevenue > 0 ? Math.round((netOperatingProfit / totalRevenue) * 1000) / 10 : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E3E9E5]">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Financial Statements & Grant Audits
          </h1>
          <p className="text-xs text-[#4B5563] mt-0.5">
            Live P&L statement summaries, operating margins and donor funding accountability.
          </p>
        </div>

        <Badge variant={netOperatingProfit >= 0 ? "primary" : "amber"} dot>
          Operating Margin: {operatingMarginPct}%
        </Badge>
      </div>

      {/* Live Profit & Loss Summary */}
      <div className="p-6 rounded-card bg-white border border-[#E3E9E5] shadow-card-elevated">
        <div className="flex items-center justify-between pb-3 border-b border-[#F0F4F2]">
          <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#00993F]" />
            <span>Profit &amp; Loss (P&amp;L) Summary</span>
          </h2>
          <span className="text-[11px] font-medium text-[#4B5563]">
            Computed from live invoices, scrap sales &amp; expenses
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 text-xs">
          <div className="p-3.5 rounded-nested bg-[#F6F8F7] border border-[#E3E9E5]">
            <span className="text-[#4B5563] block">Paid Client Invoices</span>
            <span className="font-mono text-lg font-bold text-slate-900 mt-1 block">
              {formatCurrency(invoiceRevenue, "KES")}
            </span>
          </div>

          <div className="p-3.5 rounded-nested bg-[#EEFBFD] border border-[#B6EEF5]">
            <span className="text-[#056E7C] block">Recyclable Scrap Sales</span>
            <span className="font-mono text-lg font-bold text-[#056E7C] mt-1 block">
              {formatCurrency(scrapRevenue, "KES")}
            </span>
          </div>

          <div className="p-3.5 rounded-nested bg-[#F6F8F7] border border-[#E3E9E5]">
            <span className="text-[#4B5563] block">Operating Expenses (OPEX)</span>
            <span className="font-mono text-lg font-bold text-red-600 mt-1 block">
              -{formatCurrency(totalExpenses, "KES")}
            </span>
          </div>

          <div className="p-3.5 rounded-nested bg-[#EDF9F1] border border-[#ADE4C1]">
            <span className="text-[#00682B] block">Net Operating Profit</span>
            <span className="font-mono text-lg font-extrabold text-[#00682B] mt-1 block">
              {formatCurrency(netOperatingProfit, "KES")}
            </span>
          </div>
        </div>
      </div>

      {/* NGO Grant Audits */}
      <div className="space-y-4">
        {projects.length === 0 ? (
          <div className="p-6 rounded-card bg-white border border-[#E3E9E5] text-center text-xs text-[#9CA3AF]">
            No NGO donor grant projects recorded yet.
          </div>
        ) : (
          projects.map((prj) => (
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
          ))
        )}
      </div>
    </div>
  );
}
