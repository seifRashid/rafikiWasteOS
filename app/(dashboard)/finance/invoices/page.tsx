import React from "react";
import { getFinanceLedger } from "@/server/db/queries";
import { InvoicesView } from "@/components/finance/invoices-view";

export const dynamic = "force-dynamic";

export default async function FinanceInvoicesPage() {
  const { invoices } = await getFinanceLedger();

  return <InvoicesView initialInvoices={invoices} />;
}
