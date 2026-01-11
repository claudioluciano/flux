"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ExpirationBadge, getExpirationStatus } from "./expiration-badge";
import { EmptyState } from "@/components/layout/empty-state";
import {
  Search,
  FileText,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Filter,
  Loader2,
} from "lucide-react";

type DocumentCategory =
  | "contrato_social"
  | "alteracao_social"
  | "cnpj"
  | "contrato_cliente"
  | "alvara"
  | "certidao"
  | "other";

type ExpirationFilter = "all" | "expiring_soon" | "expired" | "valid";

const CATEGORY_LABELS: Record<DocumentCategory, string> = {
  contrato_social: "Contrato Social",
  alteracao_social: "Alteracao Contratual",
  cnpj: "Cartao CNPJ",
  contrato_cliente: "Contrato com Cliente",
  alvara: "Alvara",
  certidao: "Certidao",
  other: "Outro",
};

const CATEGORY_COLORS: Record<DocumentCategory, string> = {
  contrato_social: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  alteracao_social: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
  cnpj: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  contrato_cliente: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  alvara: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  certidao: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  other: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
};

export function DocumentList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<DocumentCategory | "all">("all");
  const [expirationFilter, setExpirationFilter] = useState<ExpirationFilter>("all");
  const [deleteId, setDeleteId] = useState<Id<"documents"> | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const documents = useQuery(api.documents.queries.list, {
    category: categoryFilter !== "all" ? categoryFilter : undefined,
    expirationFilter: expirationFilter !== "all" ? expirationFilter : undefined,
  });

  const entities = useQuery(api.entities.queries.list, {});
  const remove = useMutation(api.documents.mutations.remove);

  const filteredDocuments = documents?.filter((doc) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      doc.name.toLowerCase().includes(query) ||
      doc.fileName.toLowerCase().includes(query) ||
      doc.description?.toLowerCase().includes(query)
    );
  });

  const getEntityName = (entityId?: Id<"entities">) => {
    if (!entityId || !entities) return null;
    const entity = entities.find((e) => e._id === entityId);
    return entity?.name || null;
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await remove({ id: deleteId });
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("pt-BR");
  };

  if (documents === undefined) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar documentos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Select
            value={categoryFilter}
            onValueChange={(value) => {
              if (value) setCategoryFilter(value as DocumentCategory | "all");
            }}
          >
            <SelectTrigger className="w-40">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue>
                {categoryFilter === "all"
                  ? "Categoria"
                  : CATEGORY_LABELS[categoryFilter]}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={expirationFilter}
            onValueChange={(value) => {
              if (value) setExpirationFilter(value as ExpirationFilter);
            }}
          >
            <SelectTrigger className="w-36">
              <SelectValue>
                {expirationFilter === "all"
                  ? "Validade"
                  : expirationFilter === "expiring_soon"
                    ? "Vencendo"
                    : expirationFilter === "expired"
                      ? "Vencidos"
                      : "Validos"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="expiring_soon">Vencendo em 30 dias</SelectItem>
              <SelectItem value="expired">Vencidos</SelectItem>
              <SelectItem value="valid">Validos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Document Grid */}
      {(!filteredDocuments || filteredDocuments.length === 0) ? (
        <EmptyState
          icon={FileText}
          title="Nenhum documento encontrado"
          description={
            searchQuery || categoryFilter !== "all" || expirationFilter !== "all"
              ? "Tente ajustar os filtros de busca"
              : "Comece enviando seu primeiro documento"
          }
          action={
            !searchQuery && categoryFilter === "all" && expirationFilter === "all" ? (
              <Link href="/documents/new">
                <Button>Enviar documento</Button>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredDocuments.map((doc) => (
            <Card key={doc._id} className="relative">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/documents/${doc._id}`}
                      className="font-medium hover:underline line-clamp-1"
                    >
                      {doc.name}
                    </Link>
                    <p className="text-xs text-muted-foreground truncate">
                      {doc.fileName}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button variant="ghost" size="icon" className="h-8 w-8" />
                      }
                    >
                      <MoreVertical className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem render={<Link href={`/documents/${doc._id}`} />}>
                        <Eye className="mr-2 h-4 w-4" />
                        Visualizar
                      </DropdownMenuItem>
                      <DropdownMenuItem render={<Link href={`/documents/${doc._id}/edit`} />}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setDeleteId(doc._id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <span
                    className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${CATEGORY_COLORS[doc.category]}`}
                  >
                    {CATEGORY_LABELS[doc.category]}
                  </span>
                  <ExpirationBadge expirationDate={doc.expirationDate} />
                </div>

                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Tamanho: {formatFileSize(doc.fileSize)}</p>
                  {doc.entityId && getEntityName(doc.entityId) && (
                    <p>Vinculado: {getEntityName(doc.entityId)}</p>
                  )}
                  <p>Enviado em: {formatDate(doc.createdAt)}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir documento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este documento? Esta acao nao pode ser
              desfeita e o arquivo sera permanentemente removido.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
