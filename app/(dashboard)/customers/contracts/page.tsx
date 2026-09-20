import React from "react";
import Link from "next/link";
import { FileText, Calendar, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getClientsWithStats } from "@/server/db/queries";

export const dynamic = "force-dynamic";

export default async function CustomersContractsPage() {
  const clients = await getClientsWithStats();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E3E9E5]">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Customer Service Contracts
          </h1>
          <p className="text-xs text-[#4B5563] mt-0.5">
            Service level agreements, container allocations, pricing schedules and contract renewals.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="primary" dot>
            {clients.length} Active SLA Contracts
          </Badge>
        </div>
      </div>

      {/* Contracts Table */}
      <div className="bg-white rounded-card border border-[#E3E9E5] shadow-card-elevated overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F6F8F7] border-b border-[#E3E9E5]">
              <tr className="text-[#4B5563] font-semibold">
                <th className="py-3 px-4">Account & Client</th>
                <th className="py-3 px-4">Contract Period</th>
                <th className="py-3 px-4">Collection SLA</th>
                <th className="py-3 px-4">Containers Assigned</th>
                <th className="py-3 px-4">Monthly Value</th>
                <th className="py-3 px-4">Renewal Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F4F2]">
              {clients.map((c) => (
                <tr key={c.id} className="hover:bg-[#F6F8F7] transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-[#00993F] text-[11px] block">
                      {c.accountNumber}
                    </span>
                    <span className="font-bold text-slate-900 text-sm">{c.name}</span>
                  </td>

                  <td className="py-3.5 px-4 text-[#4B5563]">
                    <div className="font-medium">
                      {formatDate(c.contractStartDate)} — {formatDate(c.contractEndDate)}
                    </div>
                    <div className="text-[10px] text-[#9CA3AF]">Annual Master Agreement</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="capitalize font-semibold text-slate-800 block">
                      {c.collectionFrequency.replace("_", " ")}
                    </span>
                    <span className="text-[11px] text-[#00993F] font-medium">{c.wasteStreams}</span>
                  </td>

                  <td className="py-3.5 px-4 font-medium text-slate-800">
                    {c.binCount || "Standard 240L Bins"}
                  </td>

                  <td className="py-3.5 px-4 font-mono font-extrabold text-slate-900">
                    {formatCurrency(c.monthlyFee, "KES")}/mo
                  </td>

                  <td className="py-3.5 px-4">
                    <Badge variant="primary" dot>
                      Active Contract
                    </Badge>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href={`/clients/${c.id}`}
                      className="px-3 py-1.5 rounded-nested bg-[#F0F4F2] hover:bg-[#E3E9E5] text-xs font-bold text-[#111827] transition-all inline-flex items-center gap-1"
                    >
                      <span>View Terms</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
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
