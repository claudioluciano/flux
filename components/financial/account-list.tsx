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
import { MoreHorizontal, Pencil, Trash, Wallet, Lock } from "lucide-react";
import { ACCOUNT_TYPE_LABELS } from "@/convex/lib/financialValidators";

type AccountType = "revenue" | "expense" | "cost";

interface AccountListProps {
  type?: AccountType;
}

const TYPE_BADGE_VARIANTS: Record<AccountType, "default" | "secondary" | "outline"> = {
  revenue: "default",
  expense: "secondary",
  cost: "outline",
};

export function AccountList({ type }: AccountListProps) {
  const accounts = useQuery(api.accounts.queries.list, { type });
  const toggleActive = useMutation(api.accounts.mutations.toggleActive);
  const remove = useMutation(api.accounts.mutations.remove);

  const [deleteId, setDeleteId] = useState<Id<"accounts"> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await remove({ id: deleteId });
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao excluir conta");
      }
      setDeleteId(null);
    }
  };

  if (accounts === undefined) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <EmptyState
        icon={Wallet}
        title="Nenhuma conta encontrada"
        description="Comece adicionando sua primeira conta contábil."
        action={
          <Link href="/accounts/new">
            <Button>Nova Conta</Button>
          </Link>
        }
      />
    );
  }

  return (
    <>
      {error && (
        <div className="mb-4 rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Código</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.map((account) => (
              <TableRow key={account._id}>
                <TableCell className="font-mono font-medium">
                  {account.code}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {account.name}
                    {account.isSystem && (
                      <Lock className="h-3 w-3 text-muted-foreground" />
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={TYPE_BADGE_VARIANTS[account.type]}>
                    {ACCOUNT_TYPE_LABELS[account.type]}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {account.description || "-"}
                </TableCell>
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
                        render={<Link href={`/accounts/${account._id}/edit`} />}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      {!account.isSystem && (
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => setDeleteId(account._id)}
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      )}
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
            <AlertDialogTitle>Excluir conta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A conta será permanentemente
              removida do sistema. Contas com transações vinculadas não podem ser excluídas.
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
