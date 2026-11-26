import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getInvoiceById } from "@/server/db/queries";
import { InvoiceDocument } from "@/components/finance/invoice-document";

export const dynamic = "force-dynamic";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const record = await getInvoiceById(id);

  if (!record) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <div className="print:hidden">
        <Link
          href="/finance/invoices"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4B5563] hover:text-[#00993F] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Invoices</span>
        </Link>
      </div>

      <InvoiceDocument invoice={record.invoice} client={record.client} />
    </div>
  );
}
