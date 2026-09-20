import React from "react";
import { getFinanceLedger } from "@/server/db/queries";
import { FileText, Download, CheckCircle2, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CustomersInvoicesPage() {
  const { invoices } = await getFinanceLedger();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E3E9E5]">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Customer Invoices & Billing
          </h1>
          <p className="text-xs text-[#4B5563] mt-0.5">
            Client monthly collection invoices, payment statuses, and M-Pesa reconciliations.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-card border border-[#E3E9E5] shadow-card-elevated overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F6F8F7] border-b border-[#E3E9E5]">
              <tr className="text-[#4B5563] font-semibold">
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Customer Account</th>
                <th className="py-3 px-4">Billing Period</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Payment Reference</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F4F2]">
              {invoices.map(({ invoice, client }) => (
                <tr key={invoice.id} className="hover:bg-[#F6F8F7] transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    {invoice.invoiceNumber}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-900 block">{client?.name || "Client"}</span>
                    <span className="text-[11px] text-[#9CA3AF] capitalize">{client?.customerType}</span>
                  </td>
                  <td className="py-3.5 px-4 text-[#4B5563]">{invoice.billingPeriod}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    {formatCurrency(invoice.amount, "KES")}
                  </td>
                  <td className="py-3.5 px-4 text-[#4B5563]">{formatDate(invoice.dueDate)}</td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-700">
                    {invoice.paymentReference || "—"}
                  </td>
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
