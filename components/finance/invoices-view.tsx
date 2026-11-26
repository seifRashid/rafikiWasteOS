"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  Eye,
  Download,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  X,
  SlidersHorizontal,
  Loader2,
  QrCode,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { InvoiceDocument } from "@/components/finance/invoice-document";
import { downloadInvoicePdf } from "@/lib/invoice-pdf";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Invoice, Client } from "@/server/db/schema";

interface InvoiceWithClient {
  invoice: Invoice;
  client: Client | null;
}

interface InvoicesViewProps {
  initialInvoices: InvoiceWithClient[];
}

export function InvoicesView({ initialInvoices }: InvoicesViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [periodFilter, setPeriodFilter] = useState<string>("all");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [selectedItem, setSelectedItem] = useState<InvoiceWithClient | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const uniquePeriods = useMemo(() => {
    const set = new Set<string>();
    initialInvoices.forEach(({ invoice }) => {
      if (invoice.billingPeriod) set.add(invoice.billingPeriod);
    });
    return Array.from(set);
  }, [initialInvoices]);

  const uniqueTiers = useMemo(() => {
    const set = new Set<string>();
    initialInvoices.forEach(({ client }) => {
      if (client?.customerType) set.add(client.customerType);
    });
    return Array.from(set).sort();
  }, [initialInvoices]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: initialInvoices.length,
      pending: 0,
      paid: 0,
      overdue: 0,
      draft: 0,
      cancelled: 0,
    };
    initialInvoices.forEach(({ invoice }) => {
      counts[invoice.status] = (counts[invoice.status] || 0) + 1;
    });
    return counts;
  }, [initialInvoices]);

  const filteredInvoices = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return initialInvoices.filter(({ invoice, client }) => {
      const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
      const matchesPeriod =
        periodFilter === "all" || invoice.billingPeriod === periodFilter;
      const matchesTier =
        tierFilter === "all" || (client?.customerType || "") === tierFilter;
      const matchesSearch =
        !q ||
        invoice.invoiceNumber.toLowerCase().includes(q) ||
        invoice.billingPeriod.toLowerCase().includes(q) ||
        (invoice.paymentReference || "").toLowerCase().includes(q) ||
        (client?.name || "").toLowerCase().includes(q) ||
        (client?.accountNumber || "").toLowerCase().includes(q);

      return matchesStatus && matchesPeriod && matchesTier && matchesSearch;
    });
  }, [initialInvoices, searchTerm, statusFilter, periodFilter, tierFilter]);

  const filteredTotalAmount = useMemo(
    () =>
      filteredInvoices.reduce(
        (sum, { invoice }) => sum + parseFloat(invoice.amount || "0"),
        0
      ),
    [filteredInvoices]
  );

  const hasActiveFilters =
    searchTerm.trim() !== "" ||
    statusFilter !== "all" ||
    periodFilter !== "all" ||
    tierFilter !== "all";

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setPeriodFilter("all");
    setTierFilter("all");
  };

  const handleQuickDownload = async (item: InvoiceWithClient) => {
    setDownloadingId(item.invoice.id);
    try {
      await downloadInvoicePdf({ invoice: item.invoice, client: item.client });
    } catch (error) {
      console.error("[QUICK_PDF_DOWNLOAD_ERROR]", error);
      alert("Unable to generate PDF. Please try again.");
    } finally {
      setDownloadingId(null);
    }
  };

  const statusPills = [
    { id: "all", label: "All Invoices", icon: FileText },
    { id: "pending", label: "Pending", icon: Clock },
    { id: "paid", label: "Paid", icon: CheckCircle2 },
    { id: "overdue", label: "Overdue", icon: AlertTriangle },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E3E9E5]">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Accounts Receivable &amp; Invoices
          </h1>
          <p className="text-xs text-[#4B5563] mt-0.5">
            Filter client invoices, inspect QR-verified statements, and download branded PDFs.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-full bg-[#EDF9F1] border border-[#ADE4C1] text-[#00682B] font-bold">
            Filtered Total: {formatCurrency(filteredTotalAmount, "KES")}
          </span>
        </div>
      </div>

      {/* Status Filter Pills (matching Client & Operations pages) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {statusPills.map((pill) => {
          const Icon = pill.icon;
          const isSelected = statusFilter === pill.id;
          const count = statusCounts[pill.id] || 0;
          return (
            <button
              key={pill.id}
              type="button"
              onClick={() => setStatusFilter(pill.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? "bg-[#00993F] text-white shadow-sm"
                  : "bg-white text-[#4B5563] border border-[#E3E9E5] hover:bg-[#F0F4F2]"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{pill.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  isSelected
                    ? "bg-white/20 text-white"
                    : "bg-[#F0F4F2] text-slate-700"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search & Secondary Filter Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search invoice #, client, account, or payment ref..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-[#E3E9E5] rounded-full text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#00993F]"
            />
          </div>

          {/* Billing Period Filter */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#9CA3AF] hidden sm:block shrink-0" />
            <select
              aria-label="Filter by billing period"
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-white border border-[#E3E9E5] rounded-full text-slate-700 font-medium focus:outline-none focus:border-[#00993F]"
            >
              <option value="all">All Periods</option>
              {uniquePeriods.map((period) => (
                <option key={period} value={period}>
                  {period}
                </option>
              ))}
            </select>

            {/* Customer Tier Filter */}
            <select
              aria-label="Filter by customer tier"
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-white border border-[#E3E9E5] rounded-full text-slate-700 font-medium capitalize focus:outline-none focus:border-[#00993F]"
            >
              <option value="all">All Client Tiers</option>
              {uniqueTiers.map((tier) => (
                <option key={tier} value={tier} className="capitalize">
                  {tier}
                </option>
              ))}
            </select>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-full text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>

        <div className="text-xs font-medium text-[#4B5563] shrink-0">
          Showing <strong>{filteredInvoices.length}</strong> of {initialInvoices.length} invoices
        </div>
      </div>

      {/* Invoices Table */}
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
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F4F2]">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-[#9CA3AF]">
                    No invoices match your current filters.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((item) => {
                  const { invoice, client } = item;
                  const isDownloading = downloadingId === invoice.id;
                  return (
                    <tr
                      key={invoice.id}
                      className="hover:bg-[#F6F8F7] transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/finance/invoices/${invoice.id}`}
                          className="font-mono font-bold text-[#00993F] hover:underline inline-flex items-center gap-1.5"
                        >
                          <QrCode className="w-3.5 h-3.5 text-[#00993F]/70" />
                          <span>{invoice.invoiceNumber}</span>
                        </Link>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">
                          {client?.name || "Client"}
                        </div>
                        <div className="text-[11px] text-[#4B5563] capitalize">
                          {client?.customerType || "Account"}
                          {client?.accountNumber ? ` • ${client.accountNumber}` : ""}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-[#4B5563]">
                        {invoice.billingPeriod}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {formatCurrency(invoice.amount, invoice.currency || "KES")}
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

                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedItem(item)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-nested bg-[#EDF9F1] text-[#00682B] border border-[#ADE4C1] text-[11px] font-bold hover:bg-[#D3F3DE] transition-colors cursor-pointer"
                            title="View Invoice with QR Code"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleQuickDownload(item)}
                            disabled={isDownloading}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-nested bg-white text-slate-700 border border-[#E3E9E5] text-[11px] font-bold hover:bg-[#F0F4F2] transition-colors disabled:opacity-50 cursor-pointer"
                            title="Download Branded PDF with QR Code"
                          >
                            {isDownloading ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#00993F]" />
                            ) : (
                              <Download className="w-3.5 h-3.5 text-[#00993F]" />
                            )}
                            <span className="hidden sm:inline">PDF</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Viewer Modal (with Green-Wave Template, QR Code & PDF Export) */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-start justify-center p-3 sm:p-6 overflow-y-auto"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="relative w-full max-w-4xl bg-[#F6F8F7] rounded-card border border-[#E3E9E5] shadow-modal p-4 sm:p-6 my-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E3E9E5]">
              <h2 className="text-sm font-extrabold text-slate-900">
                Invoice Preview — {selectedItem.invoice.invoiceNumber}
              </h2>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="w-8 h-8 rounded-full bg-white border border-[#E3E9E5] flex items-center justify-center text-slate-500 hover:text-slate-900 cursor-pointer"
                aria-label="Close invoice preview"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <InvoiceDocument
              invoice={selectedItem.invoice}
              client={selectedItem.client}
              showOpenFullPageLink
            />
          </div>
        </div>
      )}
    </div>
  );
}
