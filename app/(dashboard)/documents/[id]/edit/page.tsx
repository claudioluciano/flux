"use client";

import { use } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { PageHeader } from "@/components/layout/page-header";
import { DocumentForm } from "@/components/documents/document-form";

export default function EditDocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Editar Documento"
        description="Atualize as informacoes do documento"
      />

      <DocumentForm documentId={id as Id<"documents">} mode="edit" />
    </div>
  );
}
