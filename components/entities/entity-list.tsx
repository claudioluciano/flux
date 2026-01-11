"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { EmptyState } from "@/components/layout/empty-state";
import { Eye, MoreHorizontal, Pencil, Trash, Users } from "lucide-react";
import { formatDocument } from "@/convex/lib/validators";

type EntityFilter = "all" | "clients" | "suppliers" | "both";

interface EntityListProps {
  filter?: EntityFilter;
}

export function EntityList({ filter = "all" }: EntityListProps) {
  const entities = useQuery(api.entities.queries.list, { filter });
  const toggleActive = useMutation(api.entities.mutations.toggleActive);
  const remove = useMutation(api.entities.mutations.remove);

  const [deleteId, setDeleteId] = useState<Id<"entities"> | null>(null);

  const handleToggleActive = async (id: Id<"entities">) => {
    await toggleActive({ id });
  };

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await remove({ id: deleteId });
      } catch (error) {
        // Error handling will be done with toast later
        console.error(error);
      }
      setDeleteId(null);
    }
  };

  if (entities === undefined) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (entities.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="Nenhuma entidade encontrada"
        description="Comece adicionando seu primeiro cliente ou fornecedor."
        action={
          <Link href="/entities/new">
            <Button>Nova Entidade</Button>
          </Link>
        }
      />
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Documento</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entities.map((entity) => (
              <TableRow key={entity._id}>
                <TableCell className="font-medium">
                  <Link
                    href={`/entities/${entity._id}`}
                    className="hover:underline"
                  >
                    {entity.tradeName || entity.name}
                  </Link>
                  {entity.tradeName && (
                    <div className="text-xs text-muted-foreground">
                      {entity.name}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <span className="font-mono text-sm">
                    {formatDocument(entity.document, entity.entityType)}
                  </span>
                  <div className="text-xs text-muted-foreground">
                    {entity.entityType === "company" ? "CNPJ" : "CPF"}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {entity.isClient && (
                      <Badge variant="default">Cliente</Badge>
                    )}
                    {entity.isSupplier && (
                      <Badge variant="secondary">Fornecedor</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>{entity.email || "-"}</TableCell>
                <TableCell>{entity.phone || "-"}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={<Button variant="ghost" size="icon" />}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Ações</span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        render={<Link href={`/entities/${entity._id}`} />}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Visualizar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        render={<Link href={`/entities/${entity._id}/edit`} />}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => setDeleteId(entity._id)}
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir entidade?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A entidade será permanentemente
              removida do sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
