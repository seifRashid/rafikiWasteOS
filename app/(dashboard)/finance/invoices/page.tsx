import React from "react";
import { getFinanceLedger } from "@/server/db/queries";
import { FileText, Download, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function FinanceInvoicesPage() {
  const { invoices } = await getFinanceLedger();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E3E9E5]">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Accounts Receivable & Invoices
          </h1>
          <p className="text-xs text-[#4B5563] mt-0.5">
            Customer billing receivables, due date tracking, and overdue aging status.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-card border border-[#E3E9E5] shadow-card-elevated overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F6F8F7] border-b border-[#E3E9E5]">
              <tr className="text-[#4B5563] font-semibold">
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Billing Period</th>
                <th className="py-3 px-4">Amount Due</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F4F2]">
              {invoices.map(({ invoice, client }) => (
                <tr key={invoice.id} className="hover:bg-[#F6F8F7] transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    {invoice.invoiceNumber}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {client?.name || "Client"}
                  </td>
                  <td className="py-3.5 px-4 text-[#4B5563]">{invoice.billingPeriod}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    {formatCurrency(invoice.amount, "KES")}
                  </td>
                  <td className="py-3.5 px-4 text-[#4B5563]">{formatDate(invoice.dueDate)}</td>
                  <td className="py-3.5 px-4 text-right">
                    <Badge
                      variant={
                        invoice.status === "paid"
                          ? "primary"
                          : invoice.status === "pending"
                          ? "amber"
                          : "danger"
                      }
                      dot
                    >
                      {invoice.status}
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
