"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { PageHeader } from "@/components/layout/page-header";
import { DocumentPreview } from "@/components/documents/document-preview";
import { ExpirationBadge } from "@/components/documents/expiration-badge";
import { Edit, Trash2, Loader2, Building2, Calendar, Tag } from "lucide-react";
import { useState } from "react";

const CATEGORY_LABELS: Record<string, string> = {
  contrato_social: "Contrato Social",
  alteracao_social: "Alteracao Contratual",
  cnpj: "Cartao CNPJ",
  contrato_cliente: "Contrato com Cliente",
  alvara: "Alvara",
  certidao: "Certidao",
  other: "Outro",
};

export default function DocumentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const document = useQuery(api.documents.queries.get, {
    id: id as Id<"documents">,
  });

  const entity = useQuery(
    api.entities.queries.get,
    document?.entityId ? { id: document.entityId } : "skip"
  );

  const remove = useMutation(api.documents.mutations.remove);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await remove({ id: id as Id<"documents"> });
      router.push("/documents");
    } catch (err) {
      console.error("Delete failed:", err);
      setIsDeleting(false);
    }
  };

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return "-";
    return new Date(timestamp).toLocaleDateString("pt-BR");
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (document === undefined) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (document === null) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <p className="text-lg font-medium">Documento nao encontrado</p>
        <Link href="/documents" className="mt-4">
          <Button variant="outline">Voltar para documentos</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={document.name}
        description={CATEGORY_LABELS[document.category] || document.category}
        action={
          <div className="flex gap-2">
            <Link href={`/documents/${id}/edit`}>
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </Button>
            </Link>
            <AlertDialog>
              <AlertDialogTrigger render={<Button variant="destructive" />}>
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir documento</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja excluir este documento? Esta acao nao
                    pode ser desfeita e o arquivo sera permanentemente removido.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isDeleting}>
                    Cancelar
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isDeleting && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Preview */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Visualizacao</CardTitle>
            </CardHeader>
            <CardContent>
              <DocumentPreview
                documentId={document._id}
                fileName={document.fileName}
                fileType={document.fileType}
              />
            </CardContent>
          </Card>
        </div>

        {/* Details Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <ExpirationBadge expirationDate={document.expirationDate} />
              </div>
              {document.expirationDate && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Valido ate: {formatDate(document.expirationDate)}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Info */}
          <Card>
            <CardHeader>
              <CardTitle>Informacoes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="text-muted-foreground">Arquivo</p>
                <p className="font-medium">{document.fileName}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Tamanho</p>
                <p className="font-medium">{formatFileSize(document.fileSize)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Tipo</p>
                <p className="font-medium">{document.fileType}</p>
              </div>
              {document.issueDate && (
                <div>
                  <p className="text-muted-foreground">Data de emissao</p>
                  <p className="font-medium">{formatDate(document.issueDate)}</p>
                </div>
              )}
              <div>
                <p className="text-muted-foreground">Enviado em</p>
                <p className="font-medium">{formatDate(document.createdAt)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Linked Entity */}
          {entity && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Entidade Vinculada
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Link
                  href={`/entities/${entity._id}`}
                  className="flex items-center gap-2 text-sm hover:underline"
                >
                  <span className="font-medium">{entity.name}</span>
                  <Badge variant="outline">
                    {entity.isClient && entity.isSupplier
                      ? "Cliente/Fornecedor"
                      : entity.isClient
                        ? "Cliente"
                        : "Fornecedor"}
                  </Badge>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Description */}
          {document.description && (
            <Card>
              <CardHeader>
                <CardTitle>Descricao</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {document.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Tags */}
          {document.tags && document.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Tags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {document.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
