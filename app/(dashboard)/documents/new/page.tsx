import { PageHeader } from "@/components/layout/page-header";
import { DocumentForm } from "@/components/documents/document-form";

export default function NewDocumentPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Novo Documento"
        description="Envie um novo documento para o sistema"
      />

      <DocumentForm mode="create" />
    </div>
  );
}
