import React from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/server";
import { getClientInvoices, getClientOrganization } from "@/server/db/client-portal-queries";
import { db } from "@/server/db";
import { clients } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import {
  FileText,
  DollarSign,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Download,
  CreditCard,
  Building,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ClientInvoicesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  let activeClientId = user.clientId;
  if (!activeClientId && (user.isAdmin || user.role === "operations_manager")) {
    const [firstClient] = await db
      .select()
      .from(clients)
      .where(eq(clients.isDeleted, false))
      .limit(1);
    if (firstClient) activeClientId = firstClient.id;
  }

  if (!activeClientId) return null;

  const [invoices, client] = await Promise.all([
    getClientInvoices(activeClientId),
    getClientOrganization(activeClientId),
  ]);

  if (!client) return null;

  let outstandingAmount = 0;
  let paidAmount = 0;
  let pendingCount = 0;

  invoices.forEach((inv) => {
    const amt = parseFloat(inv.amount);
    if (inv.status === "paid") {
      paidAmount += amt;
    } else if (inv.status === "pending" || inv.status === "overdue") {
      outstandingAmount += amt;
      pendingCount++;
    }
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E3E9E5]">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Invoices & Billing History
          </h1>
          <p className="text-xs text-[#4B5563] mt-1">
            Access monthly commercial waste collection statements, receipts, and payment references.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold bg-[#EDF9F1] text-[#00682B] px-3 py-1.5 rounded-nested border border-[#ADE4C1]">
            Currency: {client.currency || "KES"}
          </span>
        </div>
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Outstanding Balance"
          value={formatCurrency(outstandingAmount, client.currency || "KES")}
          subtitle={
            pendingCount > 0
              ? `${pendingCount} invoice(s) awaiting payment`
              : "Account in good standing"
          }
          icon={<DollarSign className="w-5 h-5" />}
          accentColor={outstandingAmount > 0 ? "amber" : "primary"}
        />

        <StatCard
          title="Total Paid to Date"
          value={formatCurrency(paidAmount, client.currency || "KES")}
          subtitle="All settled contracts"
          icon={<CheckCircle2 className="w-5 h-5" />}
          accentColor="primary"
        />

        <StatCard
          title="Current Monthly Rate"
          value={formatCurrency(client.monthlyFee, client.currency || "KES")}
          subtitle={`Billed ${client.collectionFrequency.replace("_", " ")}`}
          icon={<CreditCard className="w-5 h-5" />}
          accentColor="neutral"
        />
      </div>

      {/* Payment Instructions Box */}
      <div className="bg-[#EDF9F1] rounded-card p-5 border border-[#ADE4C1] text-xs grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <span className="font-bold text-[#00682B] text-sm block mb-1">
            Official Mobile Money Channel
          </span>
          <p className="text-[#4B5563] leading-relaxed">
            Settle monthly waste management invoices instantly via Safaricom M-Pesa:
          </p>
          <div className="mt-2 space-y-1 font-mono text-slate-900">
            <div>
              <strong>Paybill Number:</strong> 522522
            </div>
            <div>
              <strong>Account Number:</strong> {client.accountNumber}
            </div>
          </div>
        </div>

        <div>
          <span className="font-bold text-[#00682B] text-sm block mb-1">
            Direct Bank Wire Instructions
          </span>
          <p className="text-[#4B5563] leading-relaxed">
            For electronic funds transfers (EFT / RTGS) or corporate cheque clearance:
          </p>
          <div className="mt-2 space-y-1 text-slate-900 font-mono">
            <div>
              <strong>Bank:</strong> Kenya Commercial Bank (KCB)
            </div>
            <div>
              <strong>Branch:</strong> Kilimani Corporate Branch
            </div>
            <div>
              <strong>Account Name:</strong> Rafiki WasteOS Ltd
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Ledger Table */}
      <div className="bg-white rounded-card p-5 border border-[#E3E9E5] shadow-card-elevated">
        <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-[#F0F4F2] mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#08A6BA]" />
          Statement Ledger ({invoices.length})
        </h3>

        {invoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E3E9E5] text-[#4B5563] font-semibold">
                  <th className="pb-3">Invoice Number</th>
                  <th className="pb-3">Billing Period</th>
                  <th className="pb-3">Issue Date</th>
                  <th className="pb-3">Due Date</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Payment Reference</th>
                  <th className="pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F4F2]">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-[#F6F8F7]">
                    <td className="py-3 font-mono font-bold text-slate-900">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3 text-[#4B5563]">{inv.billingPeriod}</td>
                    <td className="py-3 text-[#4B5563]">{formatDate(inv.issueDate)}</td>
                    <td className="py-3 text-[#4B5563]">{formatDate(inv.dueDate)}</td>
                    <td className="py-3 font-mono font-bold text-slate-900">
                      {formatCurrency(inv.amount, inv.currency)}
                    </td>
                    <td className="py-3 font-mono text-[11px] text-[#4B5563]">
                      {inv.paymentReference ? (
                        <span className="bg-[#F0F4F2] px-2 py-0.5 rounded text-slate-800">
                          {inv.paymentReference}
                        </span>
                      ) : (
                        <span className="text-[#9CA3AF]">Pending</span>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      <Badge
                        variant={
                          inv.status === "paid"
                            ? "primary"
                            : inv.status === "pending"
                            ? "amber"
                            : "danger"
                        }
                        dot
                      >
                        {inv.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-[#9CA3AF]">
            <FileText className="w-8 h-8 text-[#E3E9E5] mx-auto mb-2" />
            <p>No invoices have been billed to this account yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
