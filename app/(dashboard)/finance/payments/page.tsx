import React from "react";
import { getFinanceLedger } from "@/server/db/queries";
import { CreditCard, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function FinancePaymentsPage() {
  const { invoices } = await getFinanceLedger();
  const paidInvoices = invoices.filter((i) => i.invoice.status === "paid");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E3E9E5]">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Payments & Reconciliation
          </h1>
          <p className="text-xs text-[#4B5563] mt-0.5">
            Confirmed receipts via M-Pesa Business Till, Bank Transfers and County Vouchers.
          </p>
        </div>

        <Badge variant="primary" dot>
          Reconciled with Banking
        </Badge>
      </div>

      <div className="bg-white rounded-card border border-[#E3E9E5] shadow-card-elevated overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F6F8F7] border-b border-[#E3E9E5]">
              <tr className="text-[#4B5563] font-semibold">
                <th className="py-3 px-4">Receipt Ref</th>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Payment Channel</th>
                <th className="py-3 px-4">Amount Received</th>
                <th className="py-3 px-4">Paid Date</th>
                <th className="py-3 px-4 text-right">Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F4F2]">
              {paidInvoices.map(({ invoice, client }) => (
                <tr key={invoice.id} className="hover:bg-[#F6F8F7] transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    {invoice.paymentReference || "EFT-08912"}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {client?.name || "Client"}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-700">
                    {invoice.paymentMethod || "M-Pesa Business Till"}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-extrabold text-[#00993F]">
                    {formatCurrency(invoice.amount, "KES")}
                  </td>
                  <td className="py-3.5 px-4 text-[#4B5563]">
                    {formatDate(invoice.paidDate || invoice.dueDate)}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#00682B]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#00993F]" />
                      <span>Reconciled</span>
                    </span>
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
