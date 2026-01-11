"use client";

import { use } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { TransactionForm } from "@/components/financial/transaction-form";
import { Id } from "@/convex/_generated/dataModel";

interface EditReceivablePageProps {
  params: Promise<{ id: string }>;
}

export default function EditReceivablePage({ params }: EditReceivablePageProps) {
  const { id } = use(params);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Editar Conta a Receber"
        description="Atualize as informações da conta a receber"
      />
      <TransactionForm
        transactionId={id as Id<"transactions">}
        type="receivable"
        mode="edit"
      />
    </div>
  );
}
