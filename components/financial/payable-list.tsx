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
import { Skeleton } from "@/components/ui/skeleton";
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
import { EmptyState } from "@/components/layout/empty-state";
import { StatusBadge } from "./status-badge";
import { PaymentDialog } from "./payment-dialog";
import {
  Eye,
  MoreHorizontal,
  Pencil,
  Trash,
  CreditCard,
  Ban,
  Receipt,
} from "lucide-react";
import {
  formatCurrency,
  formatDate,
  TransactionStatus,
} from "@/convex/lib/financialValidators";

interface PayableListProps {
  status?: TransactionStatus;
}

export function PayableList({ status }: PayableListProps) {
  const transactions = useQuery(api.transactions.queries.list, {
    type: "payable",
    status,
  });
  const entities = useQuery(api.entities.queries.list, {});
  const cancel = useMutation(api.transactions.mutations.cancel);
  const remove = useMutation(api.transactions.mutations.remove);

  const [deleteId, setDeleteId] = useState<Id<"transactions"> | null>(null);
  const [paymentTransaction, setPaymentTransaction] = useState<{
    id: Id<"transactions">;
    amount: number;
    paidAmount: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCancel = async (id: Id<"transactions">) => {
    try {
      await cancel({ id });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao cancelar");
    }
  };

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await remove({ id: deleteId });
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao excluir");
      }
      setDeleteId(null);
    }
  };

  // Create entity lookup map
  const entityMap = entities?.reduce(
    (acc, entity) => {
      acc[entity._id] = entity;
      return acc;
    },
    {} as Record<string, (typeof entities)[0]>
  );

  if (transactions === undefined || entities === undefined) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <EmptyState
        icon={Receipt}
        title="Nenhuma conta a pagar"
        description="Comece registrando sua primeira conta a pagar."
        action={
          <Link href="/payables/new">
            <Button>Nova Conta a Pagar</Button>
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
              <TableHead>Descrição</TableHead>
              <TableHead>Fornecedor</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead className="text-right">Pago</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => {
              const entity = transaction.entityId
                ? entityMap?.[transaction.entityId]
                : null;
              const remaining = transaction.amount - transaction.paidAmount;

              return (
                <TableRow key={transaction._id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/payables/${transaction._id}`}
                      className="hover:underline"
                    >
                      {transaction.description}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {entity ? entity.tradeName || entity.name : "-"}
                  </TableCell>
                  <TableCell>{formatDate(transaction.dueDate)}</TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(transaction.amount)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {transaction.paidAmount > 0
                      ? formatCurrency(transaction.paidAmount)
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={transaction.status} />
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
                          render={<Link href={`/payables/${transaction._id}`} />}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Visualizar
                        </DropdownMenuItem>
                        {transaction.status !== "paid" &&
                          transaction.status !== "cancelled" && (
                            <>
                              <DropdownMenuItem
                                render={
                                  <Link href={`/payables/${transaction._id}/edit`} />
                                }
                              >
                                <Pencil className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  setPaymentTransaction({
                                    id: transaction._id,
                                    amount: transaction.amount,
                                    paidAmount: transaction.paidAmount,
                                  })
                                }
                              >
                                <CreditCard className="mr-2 h-4 w-4" />
                                Registrar Pagamento
                              </DropdownMenuItem>
                            </>
                          )}
                        <DropdownMenuSeparator />
                        {transaction.status !== "paid" &&
                          transaction.status !== "cancelled" &&
                          transaction.paidAmount === 0 && (
                            <DropdownMenuItem
                              onClick={() => handleCancel(transaction._id)}
                            >
                              <Ban className="mr-2 h-4 w-4" />
                              Cancelar
                            </DropdownMenuItem>
                          )}
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => setDeleteId(transaction._id)}
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Payment Dialog */}
      {paymentTransaction && (
        <PaymentDialog
          open={!!paymentTransaction}
          onOpenChange={() => setPaymentTransaction(null)}
          transactionId={paymentTransaction.id}
          totalAmount={paymentTransaction.amount}
          paidAmount={paymentTransaction.paidAmount}
          type="payable"
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir conta a pagar?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A transação será permanentemente
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
