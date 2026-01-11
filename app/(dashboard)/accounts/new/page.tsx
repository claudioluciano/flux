"use client";

import { PageHeader } from "@/components/layout/page-header";
import { AccountForm } from "@/components/financial/account-form";

export default function NewAccountPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Nova Conta"
        description="Adicione uma nova conta ao plano de contas"
      />
      <AccountForm mode="create" />
    </div>
  );
}
