"use client";

import { use } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { TransactionForm } from "@/components/financial/transaction-form";
import { Id } from "@/convex/_generated/dataModel";

interface EditPayablePageProps {
  params: Promise<{ id: string }>;
}

export default function EditPayablePage({ params }: EditPayablePageProps) {
  const { id } = use(params);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Editar Conta a Pagar"
        description="Atualize as informações da conta a pagar"
      />
      <TransactionForm
        transactionId={id as Id<"transactions">}
        type="payable"
        mode="edit"
      />
    </div>
  );
}
