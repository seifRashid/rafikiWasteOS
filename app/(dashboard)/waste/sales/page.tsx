import React from "react";
import { DollarSign, CheckCircle2, Truck, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatWeight } from "@/lib/utils";
import { getInventorySummary } from "@/server/db/queries";

export const dynamic = "force-dynamic";

export default async function WasteSalesPage() {
  const batches = await getInventorySummary();
  const sales = batches.filter((b) => b.totalRevenue !== null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E3E9E5]">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Recyclable Scrap Sales & Offtake
          </h1>
          <p className="text-xs text-[#4B5563] mt-0.5">
            Baled material sales dispatched to off-taker recycling converters and mills.
          </p>
        </div>

        <Badge variant="primary" dot>
          Offtake Dispatches Verified
        </Badge>
      </div>

      <div className="bg-white rounded-card border border-[#E3E9E5] shadow-card-elevated overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F6F8F7] border-b border-[#E3E9E5]">
              <tr className="text-[#4B5563] font-semibold">
                <th className="py-3 px-4">Batch Number</th>
                <th className="py-3 px-4">Buyer / Offtaker</th>
                <th className="py-3 px-4">Material Grade</th>
                <th className="py-3 px-4">Unit Rate</th>
                <th className="py-3 px-4">Total Revenue</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F4F2]">
              {sales.map((s) => (
                <tr key={s.id} className="hover:bg-[#F6F8F7] transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    {s.batchNumber}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {s.buyerName || "EcoPlast Converters"}
                  </td>
                  <td className="py-3.5 px-4 capitalize text-[#4B5563]">
                    {s.materialType.replace("_", " ")} ({s.gradeQuality})
                  </td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">
                    {formatCurrency(s.unitSellingPrice, "KES")}/kg
                  </td>
                  <td className="py-3.5 px-4 font-mono font-extrabold text-[#00993F]">
                    {formatCurrency(s.totalRevenue, "KES")}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#00682B]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#00993F]" />
                      <span>Dispatched & Invoiced</span>
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
