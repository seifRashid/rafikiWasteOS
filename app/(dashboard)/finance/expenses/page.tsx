import React from "react";
import { getFinanceLedger } from "@/server/db/queries";
import { TrendingDown, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function FinanceExpensesPage() {
  const { expenses } = await getFinanceLedger();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E3E9E5]">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Operating Expenditures (OPEX)
          </h1>
          <p className="text-xs text-[#4B5563] mt-0.5">
            Fleet fuel, vehicle servicing, worker wages, safety PPE, and facility utilities.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-card border border-[#E3E9E5] shadow-card-elevated overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F6F8F7] border-b border-[#E3E9E5]">
              <tr className="text-[#4B5563] font-semibold">
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Paid To</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F4F2]">
              {expenses.map(({ expense, vehicle }) => (
                <tr key={expense.id} className="hover:bg-[#F6F8F7] transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    {expense.expenseCode}
                  </td>
                  <td className="py-3.5 px-4 capitalize">
                    <Badge variant="neutral">{expense.category.replace("_", " ")}</Badge>
                  </td>
                  <td className="py-3.5 px-4 text-[#4B5563] max-w-sm truncate">
                    {expense.description}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-800">
                    {expense.paidTo || "Vendor"}
                  </td>
                  <td className="py-3.5 px-4 text-[#4B5563]">
                    {formatDate(expense.expenseDate)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-red-600">
                    -{formatCurrency(expense.amount, "KES")}
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
