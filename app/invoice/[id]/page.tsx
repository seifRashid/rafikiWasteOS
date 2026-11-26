import React from "react";
import { notFound } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { getInvoiceById } from "@/server/db/queries";
import { InvoiceDocument } from "@/components/finance/invoice-document";

export const dynamic = "force-dynamic";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function PublicInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!UUID_REGEX.test(id)) {
    notFound();
  }

  const record = await getInvoiceById(id);

  if (!record) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#F6F8F7] py-6 px-3 sm:px-6 print:bg-white print:p-0">
      <div className="max-w-[820px] mx-auto space-y-4">
        {/* Minimal Verified Document Header (hidden on print) */}
        <div className="flex items-center justify-between gap-3 bg-white rounded-card border border-[#E3E9E5] px-4 py-3 shadow-xs print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#00993F] text-white flex items-center justify-center font-black text-sm">
              R
            </div>
            <div>
              <p className="text-xs font-extrabold text-slate-900 leading-tight">
                Rafiki WasteOS
              </p>
              <p className="text-[11px] text-[#4B5563]">Official Digital Invoice</p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EDF9F1] border border-[#ADE4C1] text-[11px] font-bold text-[#00682B]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#00993F]" />
            <span>QR Verified</span>
          </span>
        </div>

        {/* Full Green-Wave Invoice Document with Download PDF & Print */}
        <InvoiceDocument invoice={record.invoice} client={record.client} />
      </div>
    </div>
  );
}
