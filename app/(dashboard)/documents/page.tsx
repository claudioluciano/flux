import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { DocumentList } from "@/components/documents/document-list";
import { Plus } from "lucide-react";

export default function DocumentsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Documentos"
        description="Gerencie documentos da empresa e de clientes/fornecedores"
        action={
          <Link href="/documents/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Documento
            </Button>
          </Link>
        }
      />

      <DocumentList />
    </div>
  );
}
