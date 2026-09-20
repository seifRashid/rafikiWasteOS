import React from "react";
import { getFinanceLedger } from "@/server/db/queries";
import { FinanceView } from "@/components/finance/finance-view";

export const dynamic = "force-dynamic";

export default async function FinancePage() {
  const ledger = await getFinanceLedger();

  return (
    <FinanceView
      initialInvoices={ledger.invoices}
      initialExpenses={ledger.expenses}
      initialProjects={ledger.projects}
    />
  );
}
