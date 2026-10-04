"use client";

import React, { useState } from "react";
import {
  DollarSign,
  FileText,
  TrendingDown,
  TrendingUp,
  CreditCard,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FolderKanban,
  Calendar,
  X,
  Check,
  Scale,
  ShieldCheck,
  Search,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { formatCurrency, formatDate, formatWeight } from "@/lib/utils";
import {
  createInvoiceAction,
  markInvoicePaidAction,
  createExpenseAction,
} from "@/server/actions/finance";
import type { Invoice, Expense, Project, Client, Vehicle } from "@/server/db/schema";

interface InvoiceWithClient {
  invoice: Invoice;
  client: Client | null;
}

interface ExpenseWithVehicle {
  expense: Expense;
  vehicle: Vehicle | null;
}

interface FinanceViewProps {
  initialInvoices: InvoiceWithClient[];
  initialExpenses: ExpenseWithVehicle[];
  initialProjects: Project[];
}

export function FinanceView({
  initialInvoices,
  initialExpenses,
  initialProjects,
}: FinanceViewProps) {
  const [invoicesList, setInvoicesList] = useState<InvoiceWithClient[]>(initialInvoices);
  const [expensesList, setExpensesList] = useState<ExpenseWithVehicle[]>(initialExpenses);
  const [projectsList, setProjectsList] = useState<Project[]>(initialProjects);

  const [activeTab, setActiveTab] = useState<"invoices" | "expenses" | "projects">("invoices");

  // Payment Recording Modal
  const [selectedInvoiceForPay, setSelectedInvoiceForPay] = useState<Invoice | null>(null);
  const [payMethod, setPayMethod] = useState("M-Pesa Business Till");
  const [payRef, setPayRef] = useState("");
  const [payLoading, setPayLoading] = useState(false);

  // New Expense Modal
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);
  const [expCategory, setExpCategory] = useState<any>("fuel");
  const [expAmount, setExpAmount] = useState("");
  const [expDesc, setExpDesc] = useState("");
  const [expPaidTo, setExpPaidTo] = useState("Total Kenya");
  const [expLoading, setExpLoading] = useState(false);

  // Financial aggregates
  let totalBilled = 0;
  let totalPaid = 0;
  let totalPending = 0;

  invoicesList.forEach(({ invoice }) => {
    const amt = parseFloat(invoice.amount);
    totalBilled += amt;
    if (invoice.status === "paid") totalPaid += amt;
    if (invoice.status === "pending" || invoice.status === "overdue") totalPending += amt;
  });

  let totalExpensesAmt = 0;
  expensesList.forEach(({ expense }) => {
    totalExpensesAmt += parseFloat(expense.amount);
  });

  const netCashflow = totalPaid - totalExpensesAmt;

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceForPay) return;
    setPayLoading(true);

    try {
      const res = await markInvoicePaidAction({
        invoiceId: selectedInvoiceForPay.id,
        paymentMethod: payMethod,
        paymentReference: payRef,
      });

      if (res.success) {
        setInvoicesList(
          invoicesList.map((item) =>
            item.invoice.id === selectedInvoiceForPay.id
              ? {
                  ...item,
                  invoice: {
                    ...item.invoice,
                    status: "paid",
                    paymentMethod: payMethod,
                    paymentReference: payRef,
                  },
                }
              : item
          )
        );
        setSelectedInvoiceForPay(null);
        setPayRef("");
      } else {
        alert(res.error || "Payment recording failed");
      }
    } catch {
      alert("Error saving payment");
    } finally {
      setPayLoading(false);
    }
  };

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setExpLoading(true);

    try {
      const amt = parseFloat(expAmount);
      const res = await createExpenseAction({
        category: expCategory,
        amount: amt,
        description: expDesc,
        paidTo: expPaidTo,
        expenseDate: new Date().toISOString().split("T")[0],
      });

      if (res.success && res.data) {
        setExpensesList([
          { expense: res.data as Expense, vehicle: null },
          ...expensesList,
        ]);
        setIsExpenseOpen(false);
        setExpAmount("");
        setExpDesc("");
      }
    } catch {
      alert("Failed to log expense");
    } finally {
      setExpLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E3E9E5]">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Finance, Billing & NGO Project Grants
          </h1>
          <p className="text-xs text-[#4B5563] mt-0.5">
            Client billing reconciliations, operational expenditures and donor environmental grants.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpenseOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-nested bg-white border border-[#E3E9E5] text-xs font-semibold hover:bg-[#F0F4F2] transition-all"
          >
            <TrendingDown className="w-3.5 h-3.5 text-red-600" />
            <span>Record Expense</span>
          </button>
        </div>
      </div>

      {/* Financial Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Revenue Collected"
          value={formatCurrency(totalPaid, "KES", true)}
          subtitle={`${invoicesList.filter((i) => i.invoice.status === "paid").length} paid invoices`}
          icon={<TrendingUp className="w-5 h-5" />}
          accentColor="primary"
        />

        <StatCard
          title="Outstanding Receivables"
          value={formatCurrency(totalPending, "KES", true)}
          subtitle="Pending client collection fees"
          icon={<Clock className="w-5 h-5" />}
          accentColor="amber"
        />

        <StatCard
          title="Operating Expenses"
          value={formatCurrency(totalExpensesAmt, "KES", true)}
          subtitle="Fuel, maintenance & wages"
          icon={<TrendingDown className="w-5 h-5" />}
          accentColor="neutral"
        />

        <StatCard
          title="Net Cashflow"
          value={formatCurrency(netCashflow, "KES", true)}
          subtitle="Operating operating margin"
          icon={<DollarSign className="w-5 h-5" />}
          accentColor={netCashflow >= 0 ? "primary" : "amber"}
          trend={{
            value: netCashflow >= 0 ? "+Healthy" : "-Deficit",
            isPositive: netCashflow >= 0,
          }}
        />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E3E9E5] pb-2">
        <button
          onClick={() => setActiveTab("invoices")}
          className={`flex items-center gap-2 px-4 py-2 rounded-nested text-xs font-bold transition-all ${
            activeTab === "invoices"
              ? "bg-[#00993F] text-white shadow-sm"
              : "text-[#4B5563] hover:bg-[#F0F4F2]"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Customer Invoices & Payments ({invoicesList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("expenses")}
          className={`flex items-center gap-2 px-4 py-2 rounded-nested text-xs font-bold transition-all ${
            activeTab === "expenses"
              ? "bg-[#00993F] text-white shadow-sm"
              : "text-[#4B5563] hover:bg-[#F0F4F2]"
          }`}
        >
          <TrendingDown className="w-4 h-4" />
          <span>Operating Expenses ({expensesList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("projects")}
          className={`flex items-center gap-2 px-4 py-2 rounded-nested text-xs font-bold transition-all ${
            activeTab === "projects"
              ? "bg-[#00993F] text-white shadow-sm"
              : "text-[#4B5563] hover:bg-[#F0F4F2]"
          }`}
        >
          <FolderKanban className="w-4 h-4" />
          <span>NGO Donor Grant Projects ({projectsList.length})</span>
        </button>
      </div>

      {/* Invoices Tab Table */}
      {activeTab === "invoices" && (
        <div className="bg-white rounded-card border border-[#E3E9E5] shadow-card-elevated overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F6F8F7] border-b border-[#E3E9E5]">
                <tr className="text-[#4B5563] font-semibold">
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Billing Period</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Payment Ref</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F4F2]">
                {invoicesList.map(({ invoice, client }) => (
                  <tr key={invoice.id} className="hover:bg-[#F6F8F7] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {invoice.invoiceNumber}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{client?.name || "Client"}</div>
                      <div className="text-[11px] text-[#4B5563]">{client?.customerType}</div>
                    </td>

                    <td className="py-3.5 px-4 text-[#4B5563]">{invoice.billingPeriod}</td>

                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {formatCurrency(invoice.amount, "KES")}
                    </td>

                    <td className="py-3.5 px-4 text-[#4B5563]">
                      {formatDate(invoice.dueDate)}
                    </td>

                    <td className="py-3.5 px-4">
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

                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#4B5563]">
                      {invoice.paymentReference ? (
                        <span className="font-semibold text-slate-800">
                          {invoice.paymentReference} ({invoice.paymentMethod})
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {invoice.status !== "paid" ? (
                        <button
                          onClick={() => {
                            setSelectedInvoiceForPay(invoice);
                            setPayRef(`MPESA-${Math.floor(100000 + Math.random() * 900000)}`);
                          }}
                          className="px-3 py-1.5 rounded-nested bg-[#EDF9F1] text-[#00682B] border border-[#ADE4C1] text-xs font-bold hover:bg-[#D3F3DE] transition-all"
                        >
                          Record Payment
                        </button>
                      ) : (
                        <span className="text-[11px] font-bold text-[#00993F] flex items-center justify-end gap-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>Reconciled</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Expenses Tab Table */}
      {activeTab === "expenses" && (
        <div className="bg-white rounded-card border border-[#E3E9E5] shadow-card-elevated overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F6F8F7] border-b border-[#E3E9E5]">
                <tr className="text-[#4B5563] font-semibold">
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Paid To</th>
                  <th className="py-3 px-4">Expense Date</th>
                  <th className="py-3 px-4 text-right">Vehicle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F4F2]">
                {expensesList.map(({ expense, vehicle }) => (
                  <tr key={expense.id} className="hover:bg-[#F6F8F7] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {expense.expenseCode}
                    </td>

                    <td className="py-3.5 px-4 capitalize font-semibold text-slate-800">
                      <Badge variant="neutral">{expense.category.replace("_", " ")}</Badge>
                    </td>

                    <td className="py-3.5 px-4 text-[#4B5563] max-w-sm truncate">
                      {expense.description}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-red-600">
                      -{formatCurrency(expense.amount, "KES")}
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      {expense.paidTo || "—"}
                    </td>

                    <td className="py-3.5 px-4 text-[#4B5563]">
                      {formatDate(expense.expenseDate)}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-800">
                      {vehicle?.plateNumber || "Depot Ops"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* NGO Donor Projects Tab */}
      {activeTab === "projects" && (
        <div className="space-y-4">
          {projectsList.map((prj) => {
            const budgetPercent = Math.round(
              (parseFloat(prj.spentAmount) / parseFloat(prj.budgetAmount)) * 100
            );
            const recoveryPercent = Math.round(
              (parseFloat(prj.recoveredTonnage) / parseFloat(prj.targetTonnage)) * 100
            );

            return (
              <div
                key={prj.id}
                className="bg-white rounded-card p-6 border border-[#E3E9E5] shadow-card-elevated"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F0F4F2]">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#00993F] bg-[#EDF9F1] px-2.5 py-0.5 rounded-full border border-[#ADE4C1]">
                        {prj.projectCode}
                      </span>
                      <Badge variant="primary" dot>
                        {prj.status}
                      </Badge>
                    </div>
                    <h3 className="text-base font-extrabold text-slate-900 mt-2">
                      {prj.name}
                    </h3>
                    <p className="text-xs text-[#08A6BA] font-semibold mt-0.5">
                      Donor / Partner: {prj.donorPartner}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-[#9CA3AF] block font-medium">Grant Term</span>
                    <span className="text-xs font-bold text-slate-800">
                      {formatDate(prj.startDate)} — {formatDate(prj.endDate)}
                    </span>
                  </div>
                </div>

                {/* Progress Indicators */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-5 text-xs">
                  {/* Budget Spent */}
                  <div className="p-4 rounded-nested bg-[#F6F8F7] border border-[#E3E9E5]">
                    <div className="flex justify-between items-center mb-1.5 font-bold">
                      <span className="text-slate-800">Financial Budget Utilization</span>
                      <span className="font-mono text-[#00993F]">
                        {formatCurrency(prj.spentAmount, "KES", true)} / {formatCurrency(prj.budgetAmount, "KES", true)}
                      </span>
                    </div>
                    <div className="w-full bg-[#E3E9E5] h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-[#00993F] h-full rounded-full transition-all"
                        style={{ width: `${budgetPercent}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-[#9CA3AF] mt-1 block">
                      {budgetPercent}% grant funds disbursed to community teams
                    </span>
                  </div>

                  {/* Tonnage Target */}
                  <div className="p-4 rounded-nested bg-[#F6F8F7] border border-[#E3E9E5]">
                    <div className="flex justify-between items-center mb-1.5 font-bold">
                      <span className="text-slate-800">Marine Plastic Recovery Target</span>
                      <span className="font-mono text-[#08A6BA]">
                        {prj.recoveredTonnage} t / {prj.targetTonnage} t
                      </span>
                    </div>
                    <div className="w-full bg-[#E3E9E5] h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-[#08A6BA] h-full rounded-full transition-all"
                        style={{ width: `${recoveryPercent}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-[#9CA3AF] mt-1 block">
                      {recoveryPercent}% of ocean diversion milestone reached
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#F0F4F2] flex items-center justify-between text-xs text-[#4B5563]">
                  <span>Community Beneficiaries: <strong>{prj.beneficiariesCount}</strong></span>
                  <span className="italic">{prj.notes}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Record Payment Modal */}
      {selectedInvoiceForPay && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-card max-w-md w-full p-6 shadow-modal border border-[#E3E9E5] animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F4F2]">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#00993F]" />
                Record Invoice Payment Reconciliation
              </h3>
              <button
                onClick={() => setSelectedInvoiceForPay(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-3 p-3 rounded-nested bg-[#F6F8F7] border border-[#E3E9E5] text-xs">
              <div className="flex justify-between font-medium">
                <span className="text-[#9CA3AF]">Invoice:</span>
                <span className="font-mono font-bold text-slate-900">{selectedInvoiceForPay.invoiceNumber}</span>
              </div>
              <div className="flex justify-between font-medium mt-1">
                <span className="text-[#9CA3AF]">Amount Due:</span>
                <span className="font-mono font-bold text-[#00993F]">
                  {formatCurrency(selectedInvoiceForPay.amount, "KES")}
                </span>
              </div>
            </div>

            <form onSubmit={handleRecordPayment} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-[#4B5563] block mb-1">
                  Payment Method *
                </label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="w-full p-2.5 rounded-nested border border-[#E3E9E5] bg-white focus:outline-none focus:border-[#00993F]"
                >
                  <option value="M-Pesa Business Till">M-Pesa Business Till</option>
                  <option value="Bank Wire / EFT">Bank Wire / EFT Transfer</option>
                  <option value="Cash / Depot Receipt">Cash / Depot Receipt</option>
                  <option value="County Voucher">County Government IFMIS Voucher</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-[#4B5563] block mb-1">
                  Transaction / Reference Code *
                </label>
                <input
                  type="text"
                  required
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                  className="w-full p-2.5 rounded-nested border border-[#E3E9E5] font-mono focus:outline-none focus:border-[#00993F]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#F0F4F2]">
                <button
                  type="button"
                  onClick={() => setSelectedInvoiceForPay(null)}
                  className="px-4 py-2 text-xs font-semibold text-[#4B5563] hover:bg-[#F0F4F2] rounded-nested"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={payLoading}
                  className="px-4 py-2 text-xs font-semibold bg-[#00993F] text-white rounded-nested hover:bg-[#008235] transition-colors disabled:opacity-50"
                >
                  {payLoading ? "Reconciling..." : "Confirm & Mark Paid"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Expense Modal */}
      {isExpenseOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-card max-w-md w-full p-6 shadow-modal border border-[#E3E9E5] animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F4F2]">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-red-600" />
                Record Operational Expenditure
              </h3>
              <button
                onClick={() => setIsExpenseOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-[#4B5563] block mb-1">
                  Expense Category *
                </label>
                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value)}
                  className="w-full p-2.5 rounded-nested border border-[#E3E9E5] bg-white focus:outline-none focus:border-[#00993F]"
                >
                  <option value="fuel">Diesel & Vehicle Fuel</option>
                  <option value="vehicle_maintenance">Hydraulics & Mechanical Repairs</option>
                  <option value="salaries_wages">Field Crew & Sorter Wages</option>
                  <option value="ppe_safety">Gloves, Boots & Safety PPE</option>
                  <option value="licences_compliance">NEMA Licences & County Permits</option>
                  <option value="depot_rent_utilities">Depot Utilities & Weighbridge IP</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#4B5563] block mb-1">
                    Amount (KES) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="25000"
                    value={expAmount}
                    onChange={(e) => setExpAmount(e.target.value)}
                    className="w-full p-2.5 rounded-nested border border-[#E3E9E5] font-mono focus:outline-none focus:border-[#00993F]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#4B5563] block mb-1">
                    Paid To / Vendor
                  </label>
                  <input
                    type="text"
                    value={expPaidTo}
                    onChange={(e) => setExpPaidTo(e.target.value)}
                    className="w-full p-2.5 rounded-nested border border-[#E3E9E5] focus:outline-none focus:border-[#00993F]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#4B5563] block mb-1">
                  Description *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. 50L diesel refill for Compactor KDD 482B"
                  value={expDesc}
                  onChange={(e) => setExpDesc(e.target.value)}
                  className="w-full p-2.5 rounded-nested border border-[#E3E9E5] focus:outline-none focus:border-[#00993F]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#F0F4F2]">
                <button
                  type="button"
                  onClick={() => setIsExpenseOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#4B5563] hover:bg-[#F0F4F2] rounded-nested"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={expLoading}
                  className="px-4 py-2 text-xs font-semibold bg-red-600 text-white rounded-nested hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {expLoading ? "Saving..." : "Record Expense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
