"use client";

import { use } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { AccountForm } from "@/components/financial/account-form";
import { Id } from "@/convex/_generated/dataModel";

interface EditAccountPageProps {
  params: Promise<{ id: string }>;
}

export default function EditAccountPage({ params }: EditAccountPageProps) {
  const { id } = use(params);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Editar Conta"
        description="Atualize as informações da conta"
      />
      <AccountForm accountId={id as Id<"accounts">} mode="edit" />
    </div>
  );
}
