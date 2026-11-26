"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Download,
  Printer,
  ExternalLink,
  Phone,
  Globe,
  MapPin,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  buildInvoiceLineItems,
  buildInvoiceQrPayload,
  downloadInvoicePdf,
  generateInvoiceQrDataUrl,
} from "@/lib/invoice-pdf";
import type { Invoice, Client } from "@/server/db/schema";

interface InvoiceDocumentProps {
  invoice: Invoice;
  client: Client | null;
  showOpenFullPageLink?: boolean;
}

export function InvoiceDocument({
  invoice,
  client,
  showOpenFullPageLink = false,
}: InvoiceDocumentProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [downloading, setDownloading] = useState(false);

  const currency = invoice.currency || "KES";
  const lineItems = buildInvoiceLineItems(invoice, client);
  const subtotal = parseFloat(invoice.amount || "0");
  const total = subtotal;

  useEffect(() => {
    let active = true;
    const payload = buildInvoiceQrPayload(invoice, client);
    generateInvoiceQrDataUrl(payload)
      .then((url) => {
        if (active) setQrDataUrl(url);
      })
      .catch(() => {
        if (active) setQrDataUrl("");
      });
    return () => {
      active = false;
    };
  }, [invoice, client]);

  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
      await downloadInvoicePdf({ invoice, client, qrDataUrl: qrDataUrl || undefined });
    } catch (error) {
      console.error("[INVOICE_PDF_DOWNLOAD_ERROR]", error);
      alert("Unable to generate PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const statusColors =
    invoice.status === "paid"
      ? "bg-[#EDF9F1] text-[#00682B] border-[#ADE4C1]"
      : invoice.status === "overdue"
      ? "bg-red-50 text-red-700 border-red-200"
      : "bg-[#FFF8D6] text-[#785608] border-[#FCE38A]";

  return (
    <div className="space-y-4">
      {/* Action Bar (hidden when printing) */}
      <div className="flex flex-wrap items-center justify-between gap-2 print:hidden">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-slate-900">
            {invoice.invoiceNumber}
          </span>
          <span
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase border ${statusColors}`}
          >
            {invoice.status}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {showOpenFullPageLink && (
            <Link
              href={`/finance/invoices/${invoice.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-nested bg-white border border-[#E3E9E5] text-xs font-semibold text-slate-700 hover:bg-[#F0F4F2] transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Full Page</span>
            </Link>
          )}

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-nested bg-white border border-[#E3E9E5] text-xs font-semibold text-slate-700 hover:bg-[#F0F4F2] transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={downloading}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-nested bg-[#00993F] text-white text-xs font-bold shadow-sm hover:bg-[#008235] transition-colors disabled:opacity-60 cursor-pointer"
          >
            {downloading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>{downloading ? "Generating PDF..." : "Download PDF"}</span>
          </button>
        </div>
      </div>

      {/* A4 Green-Wave Invoice Sheet */}
      <div className="relative bg-white rounded-card border border-[#E3E9E5] shadow-card-elevated overflow-hidden max-w-[820px] mx-auto print:shadow-none print:border-0 print:rounded-none">
        {/* Top-Right Layered Green Wave SVG */}
        <svg
          viewBox="0 0 800 180"
          preserveAspectRatio="none"
          className="w-full h-36 sm:h-44 absolute top-0 left-0 pointer-events-none select-none"
          aria-hidden="true"
        >
          {/* Soft grey background arc */}
          <path
            d="M0,0 L800,0 L800,150 Q560,210 260,120 Q110,75 40,0 Z"
            fill="#F4F6F5"
          />
          {/* Deep Forest Green wave */}
          <path
            d="M320,0 L800,0 L800,105 Q640,155 480,100 Q380,68 320,0 Z"
            fill="#00993F"
          />
          {/* Fresh Leaf Green highlight wave */}
          <path
            d="M380,0 L800,0 L800,72 Q645,132 505,78 Q425,48 380,0 Z"
            fill="#76C043"
          />
        </svg>

        {/* Main Invoice Content */}
        <div className="relative z-10 px-6 sm:px-10 pt-8 pb-6 space-y-7">
          {/* Brand Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#00993F] text-white flex items-center justify-center font-black text-lg shadow-sm">
                R
              </div>
              <div>
                <div className="text-xl sm:text-2xl tracking-tight leading-none">
                  <span className="font-extrabold text-[#008235]">RAFIKI</span>{" "}
                  <span className="font-light text-[#2E8B57]">WASTEOS</span>
                </div>
                <p className="text-[11px] text-[#4B5563] mt-0.5">
                  Circular Economy &amp; Waste Logistics OS
                </p>
              </div>
            </div>
          </div>

          {/* Billing To & Invoice Info Row */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 pt-2">
            {/* Billing To (Left 5 cols) */}
            <div className="sm:col-span-5 space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                Billing To:
              </p>
              <h2 className="text-base font-extrabold text-slate-900 leading-snug">
                {client?.name || "Valued Client"}
              </h2>
              <div className="text-xs text-[#4B5563] space-y-0.5 pt-1">
                <p>
                  <span className="font-bold text-slate-700 inline-block w-5">P :</span>
                  {client?.phone || "—"}
                </p>
                <p>
                  <span className="font-bold text-slate-700 inline-block w-5">E :</span>
                  {client?.email || "—"}
                </p>
                <p>
                  <span className="font-bold text-slate-700 inline-block w-5">A :</span>
                  {[client?.physicalAddress, client?.countyRegion]
                    .filter(Boolean)
                    .join(", ") || "—"}
                </p>
              </div>
            </div>

            {/* Center INVOICE Heading + Dates (4 cols) */}
            <div className="sm:col-span-4 space-y-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#00993F] tracking-tight leading-none">
                INVOICE
              </h1>
              <div className="text-xs space-y-1 pt-1">
                <div className="flex gap-2">
                  <span className="font-bold text-slate-800 w-16 shrink-0">Invoice</span>
                  <span className="font-mono text-[#4B5563]">: {invoice.invoiceNumber}</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-bold text-slate-800 w-16 shrink-0">Date</span>
                  <span className="text-[#4B5563]">: {formatDate(invoice.issueDate)}</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-bold text-slate-800 w-16 shrink-0">Due Date</span>
                  <span className="text-[#4B5563]">: {formatDate(invoice.dueDate)}</span>
                </div>
              </div>
            </div>

            {/* Right: Billing Period & Status (3 cols) */}
            <div className="sm:col-span-3 sm:text-right space-y-1.5 sm:pt-7">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#00993F]">
                Billing Period
              </p>
              <p className="text-xs font-semibold text-slate-700">{invoice.billingPeriod}</p>
              <div className="pt-1">
                <span
                  className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${statusColors}`}
                >
                  {invoice.status}
                </span>
              </div>
            </div>
          </div>

          {/* Green Header Line Items Table */}
          <div className="overflow-x-auto border-b border-[#E3E9E5]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#00993F] text-white">
                  <th className="py-2.5 px-3 font-bold text-center w-12">ST</th>
                  <th className="py-2.5 px-3 font-bold">ITEM DESCRIPTION</th>
                  <th className="py-2.5 px-3 font-bold text-right">RATE</th>
                  <th className="py-2.5 px-3 font-bold text-center w-16">QTY</th>
                  <th className="py-2.5 px-3 font-bold text-right">AMOUNT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3E9E5]">
                {lineItems.map((item) => (
                  <tr key={item.index} className="bg-white">
                    <td className="py-3.5 px-3 text-center font-mono text-slate-700 border-r border-[#F0F4F2]">
                      {item.index}
                    </td>
                    <td className="py-3.5 px-3 border-r border-[#F0F4F2]">
                      <div className="font-bold text-slate-900">{item.description}</div>
                      {item.subtext && (
                        <div className="text-[11px] text-[#4B5563] mt-0.5">{item.subtext}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-slate-800 border-r border-[#F0F4F2]">
                      {formatCurrency(item.rate, currency)}
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono text-slate-700 border-r border-[#F0F4F2]">
                      {item.qty}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-900">
                      {formatCurrency(item.amount, currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Payment Method & Totals Row */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-start">
            {/* Left: Payment Method & Notes */}
            <div className="sm:col-span-7 space-y-4 text-xs">
              <div>
                <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-[#00993F] mb-1">
                  Payment Method
                </h3>
                <div className="space-y-0.5 text-[#4B5563]">
                  <p>
                    <strong className="text-slate-800">M-PESA PAYBILL:</strong> 400222 •{" "}
                    <strong className="text-slate-800">ACCOUNT:</strong>{" "}
                    <span className="font-mono">
                      {client?.accountNumber || invoice.invoiceNumber}
                    </span>
                  </p>
                  <p>
                    <strong className="text-slate-800">BANK EFT:</strong> Rafiki WasteOS Ltd • KCB
                    Nairobi
                  </p>
                  {invoice.paymentReference && (
                    <p className="text-[#00682B] font-semibold flex items-center gap-1 pt-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#00993F]" />
                      <span>
                        Paid Ref: <span className="font-mono">{invoice.paymentReference}</span> (
                        {invoice.paymentMethod || "Reconciled"})
                      </span>
                    </p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-[#00993F] mb-1">
                  Terms &amp; Conditions / Notes
                </h3>
                <p className="text-[11px] text-[#4B5563] leading-relaxed">
                  {invoice.notes ||
                    "1. Payment should be made within 30 days via M-Pesa Business Till, Bank EFT, or County Voucher. 2. Please quote your Invoice Number as the payment reference for instant reconciliation."}
                </p>
              </div>
            </div>

            {/* Right: Subtotal, Tax & Green Total Bar */}
            <div className="sm:col-span-5 space-y-2 text-xs">
              <div className="flex items-center justify-between px-2 py-1">
                <span className="font-bold text-slate-700">SUBTOTAL</span>
                <span className="font-mono font-semibold text-slate-900">
                  {formatCurrency(subtotal, currency)}
                </span>
              </div>
              <div className="flex items-center justify-between px-2 py-1">
                <span className="font-bold text-slate-700">TAX / VAT</span>
                <span className="font-mono text-[#4B5563]">0.0%</span>
              </div>
              <div className="flex items-stretch rounded-md overflow-hidden border border-[#E3E9E5] mt-2">
                <div className="bg-gradient-to-r from-[#76C043] to-[#00993F] text-white font-extrabold px-4 py-2.5 text-sm flex items-center justify-center tracking-wide">
                  TOTAL
                </div>
                <div className="flex-1 bg-[#F0F4F2] text-slate-900 font-mono font-extrabold text-sm px-4 py-2.5 flex items-center justify-end">
                  {formatCurrency(total, currency)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Wave Band: QR Code + Signature + Contact Info */}
        <div className="relative mt-4 pt-8 pb-6 px-6 sm:px-10 overflow-hidden bg-[#F4F6F5]/80 border-t border-[#E3E9E5]/60">
          {/* Bottom-Left Layered Green Wave SVG */}
          <svg
            viewBox="0 0 800 170"
            preserveAspectRatio="none"
            className="w-full h-32 sm:h-40 absolute bottom-0 left-0 pointer-events-none select-none"
            aria-hidden="true"
          >
            <path
              d="M0,45 Q230,-15 440,85 Q520,125 570,170 L0,170 Z"
              fill="#00993F"
            />
            <path
              d="M0,72 Q215,20 405,105 Q475,138 515,170 L0,170 Z"
              fill="#76C043"
            />
          </svg>

          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-12 gap-6 items-end">
            {/* Bottom-Left Website inside wave */}
            <div className="sm:col-span-4 order-3 sm:order-1 pt-4 sm:pt-12">
              <p className="text-[11px] font-bold tracking-[0.2em] text-slate-900">
                www.rafikiwaste.co.ke
              </p>
            </div>

            {/* Center QR Code Block */}
            <div className="sm:col-span-4 order-1 sm:order-2 flex items-center gap-3">
              <div className="w-20 h-20 rounded-lg bg-white p-1.5 border border-[#E3E9E5] shadow-xs shrink-0 flex items-center justify-center">
                {qrDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={qrDataUrl}
                    alt={`QR code for invoice ${invoice.invoiceNumber}`}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Loader2 className="w-4 h-4 animate-spin text-[#00993F]" />
                )}
              </div>
              <div className="text-xs">
                <p className="font-extrabold text-slate-800 text-sm">More Info</p>
                <p className="text-[11px] text-[#4B5563]">Scan QR to verify</p>
                <p className="font-mono text-[10px] text-[#00993F] font-semibold mt-0.5">
                  {invoice.invoiceNumber}
                </p>
              </div>
            </div>

            {/* Right Signature & Contact Details */}
            <div className="sm:col-span-4 order-2 sm:order-3 sm:text-right space-y-4">
              <div className="inline-block sm:text-right">
                <div className="border-b border-slate-400 w-36 sm:ml-auto mb-1" />
                <p className="text-xs font-bold text-slate-900">Finance &amp; Billing Dept</p>
                <p className="text-[10px] text-[#4B5563]">Rafiki WasteOS Ltd</p>
              </div>

              <div className="space-y-1 text-[11px] text-[#4B5563]">
                <p className="flex items-center sm:justify-end gap-1.5">
                  <span>+254 700 000 000</span>
                  <Phone className="w-3 h-3 text-slate-700 shrink-0" />
                </p>
                <p className="flex items-center sm:justify-end gap-1.5">
                  <span>billing@rafikiwaste.co.ke</span>
                  <Globe className="w-3 h-3 text-slate-700 shrink-0" />
                </p>
                <p className="flex items-center sm:justify-end gap-1.5">
                  <span>Nairobi Industrial Area, Kenya</span>
                  <MapPin className="w-3 h-3 text-slate-700 shrink-0" />
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
