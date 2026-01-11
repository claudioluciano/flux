"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface EntityFormData {
  name: string;
  tradeName?: string;
  document: string;
  entityType: "company" | "individual";
  isClient: boolean;
  isSupplier: boolean;
  email?: string;
  phone?: string;
  website?: string;
  address?: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  stateRegistration?: string;
  municipalRegistration?: string;
  notes?: string;
}

interface EntityFormProps {
  entityId?: Id<"entities">;
  mode: "create" | "edit";
}

const BRAZILIAN_STATES = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO",
  "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI",
  "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

export function EntityForm({ entityId, mode }: EntityFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const entity = useQuery(
    api.entities.queries.get,
    entityId ? { id: entityId } : "skip"
  );

  const create = useMutation(api.entities.mutations.create);
  const update = useMutation(api.entities.mutations.update);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EntityFormData>({
    defaultValues: entity
      ? {
          name: entity.name,
          tradeName: entity.tradeName,
          document: entity.document,
          entityType: entity.entityType,
          isClient: entity.isClient,
          isSupplier: entity.isSupplier,
          email: entity.email,
          phone: entity.phone,
          website: entity.website,
          address: entity.address,
          stateRegistration: entity.stateRegistration,
          municipalRegistration: entity.municipalRegistration,
          notes: entity.notes,
        }
      : {
          entityType: "company",
          isClient: true,
          isSupplier: false,
        },
  });

  const entityType = watch("entityType");
  const isClient = watch("isClient");
  const isSupplier = watch("isSupplier");

  const onSubmit = async (data: EntityFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate at least one role is selected
      if (!data.isClient && !data.isSupplier) {
        setError("Selecione pelo menos um tipo: Cliente ou Fornecedor");
        setIsSubmitting(false);
        return;
      }

      // Normalize document
      const normalizedDoc = data.document.replace(/\D/g, "");

      const entityData = {
        name: data.name,
        tradeName: data.tradeName || undefined,
        document: normalizedDoc,
        entityType: data.entityType,
        isClient: data.isClient,
        isSupplier: data.isSupplier,
        email: data.email || undefined,
        phone: data.phone || undefined,
        website: data.website || undefined,
        address: data.address?.street
          ? {
              street: data.address.street,
              number: data.address.number,
              complement: data.address.complement || undefined,
              neighborhood: data.address.neighborhood,
              city: data.address.city,
              state: data.address.state,
              zipCode: data.address.zipCode,
            }
          : undefined,
        stateRegistration: data.stateRegistration || undefined,
        municipalRegistration: data.municipalRegistration || undefined,
        notes: data.notes || undefined,
        tags: undefined,
      };

      if (mode === "create") {
        await create(entityData);
      } else if (entityId) {
        await update({ id: entityId, ...entityData });
      }

      router.push("/entities");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar entidade");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state while fetching entity in edit mode
  if (mode === "edit" && entity === undefined) {
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

      {/* Entity Type & Role */}
      <Card>
        <CardHeader>
          <CardTitle>Tipo de Entidade</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Pessoa</Label>
            <Select
              value={entityType}
              onValueChange={(value) => {
                if (value) setValue("entityType", value as "company" | "individual");
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="company">Pessoa Jurídica (CNPJ)</SelectItem>
                <SelectItem value="individual">Pessoa Física (CPF)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap gap-6">
            <div className="flex items-center space-x-2">
              <Switch
                id="isClient"
                checked={isClient}
                onCheckedChange={(checked) => setValue("isClient", checked)}
              />
              <Label htmlFor="isClient">Cliente</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isSupplier"
                checked={isSupplier}
                onCheckedChange={(checked) => setValue("isSupplier", checked)}
              />
              <Label htmlFor="isSupplier">Fornecedor</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informações Básicas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">
                {entityType === "company" ? "Razão Social" : "Nome Completo"} *
              </Label>
              <Input
                id="name"
                {...register("name", { required: "Nome é obrigatório" })}
                placeholder={
                  entityType === "company"
                    ? "Razão Social da Empresa"
                    : "Nome Completo"
                }
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            {entityType === "company" && (
              <div className="space-y-2">
                <Label htmlFor="tradeName">Nome Fantasia</Label>
                <Input
                  id="tradeName"
                  {...register("tradeName")}
                  placeholder="Nome Fantasia"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="document">
                {entityType === "company" ? "CNPJ" : "CPF"} *
              </Label>
              <Input
                id="document"
                {...register("document", {
                  required: "Documento é obrigatório",
                })}
                placeholder={
                  entityType === "company"
                    ? "00.000.000/0000-00"
                    : "000.000.000-00"
                }
              />
              {errors.document && (
                <p className="text-sm text-destructive">
                  {errors.document.message}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Info */}
      <Card>
        <CardHeader>
          <CardTitle>Contato</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="email@exemplo.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                {...register("phone")}
                placeholder="(00) 00000-0000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                {...register("website")}
                placeholder="https://www.exemplo.com"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address */}
      <Card>
        <CardHeader>
          <CardTitle>Endereço</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="address.street">Logradouro</Label>
              <Input
                id="address.street"
                {...register("address.street")}
                placeholder="Rua, Avenida, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address.number">Número</Label>
              <Input
                id="address.number"
                {...register("address.number")}
                placeholder="123"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address.complement">Complemento</Label>
              <Input
                id="address.complement"
                {...register("address.complement")}
                placeholder="Apto, Sala, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address.neighborhood">Bairro</Label>
              <Input
                id="address.neighborhood"
                {...register("address.neighborhood")}
                placeholder="Bairro"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address.city">Cidade</Label>
              <Input
                id="address.city"
                {...register("address.city")}
                placeholder="Cidade"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address.state">Estado</Label>
              <Select
                value={watch("address.state") || ""}
                onValueChange={(value) => {
                  if (value) setValue("address.state", value);
                }}
              >
                <SelectTrigger>
                  <SelectValue>
                    {watch("address.state") || "UF"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {BRAZILIAN_STATES.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address.zipCode">CEP</Label>
              <Input
                id="address.zipCode"
                {...register("address.zipCode")}
                placeholder="00000-000"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tax Info (Company only) */}
      {entityType === "company" && (
        <Card>
          <CardHeader>
            <CardTitle>Inscrições</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="stateRegistration">Inscrição Estadual</Label>
                <Input
                  id="stateRegistration"
                  {...register("stateRegistration")}
                  placeholder="Inscrição Estadual"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="municipalRegistration">
                  Inscrição Municipal
                </Label>
                <Input
                  id="municipalRegistration"
                  {...register("municipalRegistration")}
                  placeholder="Inscrição Municipal"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Observações</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            {...register("notes")}
            placeholder="Observações sobre a entidade..."
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/entities")}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === "create" ? "Criar Entidade" : "Salvar Alterações"}
        </Button>
      </div>
    </form>
  );
}
