"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/financial/status-badge";
import { PaymentDialog } from "@/components/financial/payment-dialog";
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
import { Pencil, CreditCard, Ban, Trash } from "lucide-react";
import {
  formatCurrency,
  formatDate,
  PAYMENT_METHOD_LABELS,
  PaymentMethod,
} from "@/convex/lib/financialValidators";

interface PayableDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function PayableDetailPage({ params }: PayableDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();

  const transaction = useQuery(api.transactions.queries.get, {
    id: id as Id<"transactions">,
  });

  const cancel = useMutation(api.transactions.mutations.cancel);
  const remove = useMutation(api.transactions.mutations.remove);

  const [showPayment, setShowPayment] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCancel = async () => {
    try {
      await cancel({ id: id as Id<"transactions"> });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao cancelar");
    }
  };

  const handleDelete = async () => {
    try {
      await remove({ id: id as Id<"transactions"> });
      router.push("/payables");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao excluir");
    }
    setShowDelete(false);
  };

  if (transaction === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (transaction === null) {
    return (
      <div className="space-y-6">
        <PageHeader title="Conta não encontrada" />
        <p className="text-muted-foreground">
          A conta a pagar solicitada não foi encontrada.
        </p>
        <Link href="/payables">
          <Button variant="outline">Voltar para Contas a Pagar</Button>
        </Link>
      </div>
    );
  }

  const remaining = transaction.remainingBalance;
  const canEdit =
    transaction.status !== "paid" && transaction.status !== "cancelled";
  const canPay = canEdit;
  const canCancel = canEdit && transaction.paidAmount === 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title={transaction.description}
        description="Detalhes da conta a pagar"
        action={
          <div className="flex gap-2">
            {canPay && (
              <Button onClick={() => setShowPayment(true)}>
                <CreditCard className="mr-2 h-4 w-4" />
                Registrar Pagamento
              </Button>
            )}
            {canEdit && (
              <Link href={`/payables/${id}/edit`}>
                <Button variant="outline">
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </Button>
              </Link>
            )}
          </div>
        }
      />

      {error && (
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Main Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Informações
              <StatusBadge status={transaction.status} />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Descrição</p>
              <p className="font-medium">{transaction.description}</p>
            </div>
            {transaction.entity && (
              <div>
                <p className="text-sm text-muted-foreground">Fornecedor</p>
                <p className="font-medium">
                  {transaction.entity.tradeName || transaction.entity.name}
                </p>
              </div>
            )}
            {transaction.account && (
              <div>
                <p className="text-sm text-muted-foreground">Categoria</p>
                <p className="font-medium">
                  {transaction.account.code} - {transaction.account.name}
                </p>
              </div>
            )}
            {transaction.notes && (
              <div>
                <p className="text-sm text-muted-foreground">Observações</p>
                <p>{transaction.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Values & Dates */}
        <Card>
          <CardHeader>
            <CardTitle>Valores e Datas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Valor Total</p>
                <p className="text-xl font-bold">
                  {formatCurrency(transaction.amount)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Valor Pago</p>
                <p className="text-xl font-bold text-green-600">
                  {formatCurrency(transaction.paidAmount)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Saldo Restante</p>
                <p className="text-xl font-bold text-primary">
                  {formatCurrency(remaining)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vencimento</p>
                <p className="text-xl font-medium">
                  {formatDate(transaction.dueDate)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <p className="text-sm text-muted-foreground">Data de Emissão</p>
                <p>{formatDate(transaction.issueDate)}</p>
              </div>
              {transaction.paidAt && (
                <div>
                  <p className="text-sm text-muted-foreground">
                    Data do Pagamento
                  </p>
                  <p>{formatDate(transaction.paidAt)}</p>
                </div>
              )}
              {transaction.paymentMethod && (
                <div>
                  <p className="text-sm text-muted-foreground">
                    Forma de Pagamento
                  </p>
                  <p>
                    {
                      PAYMENT_METHOD_LABELS[
                        transaction.paymentMethod as PaymentMethod
                      ]
                    }
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          {canCancel && (
            <Button variant="outline" onClick={handleCancel}>
              <Ban className="mr-2 h-4 w-4" />
              Cancelar Transação
            </Button>
          )}
          <Button variant="destructive" onClick={() => setShowDelete(true)}>
            <Trash className="mr-2 h-4 w-4" />
            Excluir
          </Button>
        </CardContent>
      </Card>

      {/* Payment Dialog */}
      <PaymentDialog
        open={showPayment}
        onOpenChange={setShowPayment}
        transactionId={id as Id<"transactions">}
        totalAmount={transaction.amount}
        paidAmount={transaction.paidAmount}
        type="payable"
      />

      {/* Delete Confirmation */}
      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
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
    </div>
  );
}
