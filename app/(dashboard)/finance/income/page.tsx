import React from "react";
import { Badge } from "@/components/ui/badge";
import { getFinanceLedger } from "@/server/db/queries";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function FinanceIncomePage() {
  const { invoices, scrapSales, projects } = await getFinanceLedger();

  const paidInvoices = invoices.filter((i) => i.invoice.status === "paid");
  const paidInvoicesTotal = paidInvoices.reduce(
    (sum, i) => sum + parseFloat(i.invoice.amount || "0"),
    0
  );

  const scrapSalesTotal = scrapSales.reduce(
    (sum, batch) => sum + parseFloat(batch.totalRevenue || "0"),
    0
  );

  const grantsDisbursedTotal = projects.reduce(
    (sum, prj) => sum + parseFloat(prj.spentAmount || "0"),
    0
  );

  const grandTotal = paidInvoicesTotal + scrapSalesTotal + grantsDisbursedTotal;

  const pct = (value: number) =>
    grandTotal > 0 ? Math.round((value / grandTotal) * 100) : 0;

  const streams = [
    {
      source: "Client Collection Service Fees (Paid Invoices)",
      category: "Contract Subscriptions",
      amount: paidInvoicesTotal,
      share: `${pct(paidInvoicesTotal)}%`,
      meta: `${paidInvoices.length} paid ${paidInvoices.length === 1 ? "invoice" : "invoices"}`,
      color: "bg-[#00993F]",
    },
    {
      source: "Recyclable Scrap Sales (Waste Module)",
      category: "Commodity Offtake",
      amount: scrapSalesTotal,
      share: `${pct(scrapSalesTotal)}%`,
      meta: `${scrapSales.length} revenue-generating ${scrapSales.length === 1 ? "batch" : "batches"}`,
      color: "bg-[#08A6BA]",
    },
    {
      source: "NGO Donor Environmental Grants (Disbursed)",
      category: "Donor Funding",
      amount: grantsDisbursedTotal,
      share: `${pct(grantsDisbursedTotal)}%`,
      meta: `${projects.length} tracked ${projects.length === 1 ? "project" : "projects"}`,
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
            Live breakdown across paid client invoices, recyclable scrap sales and donor grants.
          </p>
        </div>

        <Badge variant="primary" dot>
          Total Inflow: {formatCurrency(grandTotal, "KES", true)}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {streams.map((s) => (
          <div
            key={s.category}
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
            <div className="text-[11px] text-[#4B5563] mt-1.5 flex items-center justify-between">
              <span>Contributes {s.share} of inflow</span>
              <span className="font-semibold text-slate-700">{s.meta}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
