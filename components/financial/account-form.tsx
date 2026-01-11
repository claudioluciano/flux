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
import { ACCOUNT_TYPE_LABELS } from "@/convex/lib/financialValidators";

interface AccountFormData {
  code: string;
  name: string;
  type: "revenue" | "expense" | "cost";
  description?: string;
}

interface AccountFormProps {
  accountId?: Id<"accounts">;
  mode: "create" | "edit";
}

export function AccountForm({ accountId, mode }: AccountFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const account = useQuery(
    api.accounts.queries.get,
    accountId ? { id: accountId } : "skip"
  );

  const create = useMutation(api.accounts.mutations.create);
  const update = useMutation(api.accounts.mutations.update);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<AccountFormData>({
    defaultValues: {
      type: "expense",
    },
  });

  // Update form when account data loads
  useEffect(() => {
    if (account && mode === "edit") {
      reset({
        code: account.code,
        name: account.name,
        type: account.type,
        description: account.description,
      });
    }
  }, [account, mode, reset]);

  const accountType = watch("type");

  const onSubmit = async (data: AccountFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const accountData = {
        code: data.code.toUpperCase().trim(),
        name: data.name.trim(),
        type: data.type,
        description: data.description?.trim() || undefined,
      };

      if (mode === "create") {
        await create(accountData);
      } else if (accountId) {
        await update({ id: accountId, ...accountData });
      }

      router.push("/accounts");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar conta");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state while fetching account in edit mode
  if (mode === "edit" && account === undefined) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Informações da Conta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="code">Código *</Label>
              <Input
                id="code"
                {...register("code", { required: "Código é obrigatório" })}
                placeholder="Ex: D001, R002"
                disabled={mode === "edit" && account?.isSystem}
              />
              {errors.code && (
                <p className="text-sm text-destructive">{errors.code.message}</p>
              )}
              {mode === "edit" && account?.isSystem && (
                <p className="text-xs text-muted-foreground">
                  Código de contas do sistema não pode ser alterado
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipo *</Label>
              <Select
                value={accountType}
                onValueChange={(value) => {
                  if (value) setValue("type", value as "revenue" | "expense" | "cost");
                }}
                disabled={mode === "edit" && account?.isSystem}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ACCOUNT_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {mode === "edit" && account?.isSystem && (
                <p className="text-xs text-muted-foreground">
                  Tipo de contas do sistema não pode ser alterado
                </p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                {...register("name", { required: "Nome é obrigatório" })}
                placeholder="Nome da conta"
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Descrição opcional da conta..."
                rows={3}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/accounts")}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === "create" ? "Criar Conta" : "Salvar Alterações"}
        </Button>
      </div>
    </form>
  );
}
