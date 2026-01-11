"use client";

import { PageHeader } from "@/components/layout/page-header";
import { TransactionForm } from "@/components/financial/transaction-form";

export default function NewReceivablePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Nova Conta a Receber"
        description="Registre uma nova conta a receber"
      />
      <TransactionForm type="receivable" mode="create" />
    </div>
  );
}
