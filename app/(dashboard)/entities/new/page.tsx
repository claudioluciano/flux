import { PageHeader } from "@/components/layout/page-header";
import { EntityForm } from "@/components/entities/entity-form";

export default function NewEntityPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Nova Entidade"
        description="Adicione um novo cliente ou fornecedor"
      />
      <EntityForm mode="create" />
    </div>
  );
}
