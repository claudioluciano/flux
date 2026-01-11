"use client";

import { use } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { EntityForm } from "@/components/entities/entity-form";
import { Id } from "@/convex/_generated/dataModel";

interface EditEntityPageProps {
  params: Promise<{ id: string }>;
}

export default function EditEntityPage({ params }: EditEntityPageProps) {
  const { id } = use(params);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Editar Entidade"
        description="Atualize as informações da entidade"
      />
      <EntityForm entityId={id as Id<"entities">} mode="edit" />
    </div>
  );
}
