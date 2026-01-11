"use client";

import { PageHeader } from "@/components/layout/page-header";
import { TransactionForm } from "@/components/financial/transaction-form";

export default function NewPayablePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Nova Conta a Pagar"
        description="Registre uma nova conta a pagar"
      />
      <TransactionForm type="payable" mode="create" />
    </div>
  );
}
