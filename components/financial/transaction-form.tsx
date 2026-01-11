"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import {
  ACCOUNT_TYPE_LABELS,
  formatCurrency,
} from "@/convex/lib/financialValidators";

type TransactionType = "payable" | "receivable";

interface TransactionFormData {
  entityId?: string;
  accountId?: string;
  description: string;
  notes?: string;
  amount: number;
  issueDate: string;
  dueDate: string;
}

interface TransactionFormProps {
  transactionId?: Id<"transactions">;
  type: TransactionType;
  mode: "create" | "edit";
}

export function TransactionForm({ transactionId, type, mode }: TransactionFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const basePath = type === "payable" ? "/payables" : "/receivables";

  const transaction = useQuery(
    api.transactions.queries.get,
    transactionId ? { id: transactionId } : "skip"
  );

  // Get entities (clients for receivables, suppliers for payables)
  const entityFilter = type === "payable" ? "suppliers" : "clients";
  const entities = useQuery(api.entities.queries.list, { filter: entityFilter });

  // Get accounts (revenue for receivables, expense/cost for payables)
  const accountType = type === "payable" ? "expense" : "revenue";
  const accounts = useQuery(api.accounts.queries.list, { type: accountType });

  const create = useMutation(api.transactions.mutations.create);
  const update = useMutation(api.transactions.mutations.update);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<TransactionFormData>({
    defaultValues: {
      issueDate: new Date().toISOString().split("T")[0],
      dueDate: new Date().toISOString().split("T")[0],
      amount: 0,
    },
  });

  // Update form when transaction data loads
  useEffect(() => {
    if (transaction && mode === "edit") {
      reset({
        entityId: transaction.entityId || undefined,
        accountId: transaction.accountId || undefined,
        description: transaction.description,
        notes: transaction.notes,
        amount: transaction.amount,
        issueDate: new Date(transaction.issueDate).toISOString().split("T")[0],
        dueDate: new Date(transaction.dueDate).toISOString().split("T")[0],
      });
    }
  }, [transaction, mode, reset]);

  const selectedEntityId = watch("entityId");
  const selectedAccountId = watch("accountId");

  const onSubmit = async (data: TransactionFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const transactionData = {
        type,
        entityId: data.entityId ? (data.entityId as Id<"entities">) : undefined,
        accountId: data.accountId ? (data.accountId as Id<"accounts">) : undefined,
        description: data.description.trim(),
        notes: data.notes?.trim() || undefined,
        amount: Number(data.amount),
        issueDate: new Date(data.issueDate).getTime(),
        dueDate: new Date(data.dueDate).getTime(),
      };

      if (mode === "create") {
        await create(transactionData);
      } else if (transactionId) {
        await update({ id: transactionId, ...transactionData });
      }

      router.push(basePath);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar transação");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state while fetching transaction in edit mode
  if (mode === "edit" && transaction === undefined) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const entityLabel = type === "payable" ? "Fornecedor" : "Cliente";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informações Básicas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Descrição *</Label>
            <Input
              id="description"
              {...register("description", { required: "Descrição é obrigatória" })}
              placeholder="Descrição da transação"
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="entityId">{entityLabel}</Label>
              <Select
                value={selectedEntityId || ""}
                onValueChange={(value) => setValue("entityId", value || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={`Selecione um ${entityLabel.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                  {entities?.map((entity) => (
                    <SelectItem key={entity._id} value={entity._id}>
                      {entity.tradeName || entity.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountId">Categoria</Label>
              <Select
                value={selectedAccountId || ""}
                onValueChange={(value) => setValue("accountId", value || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {accounts?.map((account) => (
                    <SelectItem key={account._id} value={account._id}>
                      {account.code} - {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              {...register("notes")}
              placeholder="Observações adicionais..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Values & Dates */}
      <Card>
        <CardHeader>
          <CardTitle>Valores e Datas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="amount">Valor (R$) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                {...register("amount", {
                  required: "Valor é obrigatório",
                  min: { value: 0.01, message: "Valor deve ser maior que zero" },
                })}
                placeholder="0,00"
              />
              {errors.amount && (
                <p className="text-sm text-destructive">{errors.amount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="issueDate">Data de Emissão *</Label>
              <Input
                id="issueDate"
                type="date"
                {...register("issueDate", { required: "Data de emissão é obrigatória" })}
              />
              {errors.issueDate && (
                <p className="text-sm text-destructive">{errors.issueDate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Data de Vencimento *</Label>
              <Input
                id="dueDate"
                type="date"
                {...register("dueDate", { required: "Data de vencimento é obrigatória" })}
              />
              {errors.dueDate && (
                <p className="text-sm text-destructive">{errors.dueDate.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(basePath)}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === "create" ? "Criar" : "Salvar Alterações"}
        </Button>
      </div>
    </form>
  );
}
