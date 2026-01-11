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
import { DocumentUpload } from "./document-upload";

interface DocumentFormData {
  name: string;
  category: string;
  entityId?: string;
  description?: string;
  issueDate?: string;
  expirationDate?: string;
  tags?: string;
}

interface UploadedFile {
  storageId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
}

interface DocumentFormProps {
  documentId?: Id<"documents">;
  mode: "create" | "edit";
}

const DOCUMENT_CATEGORIES = [
  { value: "contrato_social", label: "Contrato Social" },
  { value: "alteracao_social", label: "Alteracao Contratual" },
  { value: "cnpj", label: "Cartao CNPJ" },
  { value: "contrato_cliente", label: "Contrato com Cliente" },
  { value: "alvara", label: "Alvara de Funcionamento" },
  { value: "certidao", label: "Certidao" },
  { value: "other", label: "Outro" },
];

export function DocumentForm({ documentId, mode }: DocumentFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);

  const document = useQuery(
    api.documents.queries.get,
    documentId ? { id: documentId } : "skip"
  );

  const entities = useQuery(api.entities.queries.list, {});

  const create = useMutation(api.documents.mutations.create);
  const update = useMutation(api.documents.mutations.update);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<DocumentFormData>({
    defaultValues: {
      category: "other",
    },
  });

  // Reset form when document data loads
  useEffect(() => {
    if (document && mode === "edit") {
      reset({
        name: document.name,
        category: document.category,
        entityId: document.entityId || "",
        description: document.description || "",
        issueDate: document.issueDate
          ? new Date(document.issueDate).toISOString().split("T")[0]
          : "",
        expirationDate: document.expirationDate
          ? new Date(document.expirationDate).toISOString().split("T")[0]
          : "",
        tags: document.tags?.join(", ") || "",
      });
    }
  }, [document, mode, reset]);

  const category = watch("category");
  const entityId = watch("entityId");

  const onSubmit = async (data: DocumentFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate file for create mode
      if (mode === "create" && !uploadedFile) {
        setError("Selecione um arquivo para upload");
        setIsSubmitting(false);
        return;
      }

      const documentData = {
        name: data.name,
        category: data.category as
          | "contrato_social"
          | "alteracao_social"
          | "cnpj"
          | "contrato_cliente"
          | "alvara"
          | "certidao"
          | "other",
        entityId: data.entityId
          ? (data.entityId as Id<"entities">)
          : undefined,
        description: data.description || undefined,
        issueDate: data.issueDate
          ? new Date(data.issueDate).getTime()
          : undefined,
        expirationDate: data.expirationDate
          ? new Date(data.expirationDate).getTime()
          : undefined,
        tags: data.tags
          ? data.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : undefined,
      };

      if (mode === "create") {
        await create({
          ...documentData,
          storageId: uploadedFile!.storageId as Id<"_storage">,
          fileName: uploadedFile!.fileName,
          fileType: uploadedFile!.fileType,
          fileSize: uploadedFile!.fileSize,
        });
      } else if (documentId) {
        await update({ id: documentId, ...documentData });
      }

      router.push("/documents");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar documento");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state while fetching document in edit mode
  if (mode === "edit" && document === undefined) {
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

      {/* File Upload (only in create mode) */}
      {mode === "create" && (
        <Card>
          <CardHeader>
            <CardTitle>Arquivo</CardTitle>
          </CardHeader>
          <CardContent>
            <DocumentUpload
              onUploadComplete={(file) => {
                setUploadedFile(file);
                // Auto-fill name if empty
                if (!watch("name")) {
                  const nameWithoutExtension = file.fileName
                    .split(".")
                    .slice(0, -1)
                    .join(".");
                  setValue("name", nameWithoutExtension);
                }
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* Document Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informacoes do Documento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do documento *</Label>
              <Input
                id="name"
                {...register("name", { required: "Nome e obrigatorio" })}
                placeholder="Ex: Contrato Social 2024"
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Categoria *</Label>
              <Select
                value={category}
                onValueChange={(value) => {
                  if (value) setValue("category", value);
                }}
              >
                <SelectTrigger>
                  <SelectValue>
                    {DOCUMENT_CATEGORIES.find((c) => c.value === category)?.label ||
                      "Selecione"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Entidade vinculada</Label>
            <Select
              value={entityId || ""}
              onValueChange={(value) => {
                setValue("entityId", value || undefined);
              }}
            >
              <SelectTrigger>
                <SelectValue>
                  {entityId
                    ? entities?.find((e) => e._id === entityId)?.name ||
                      "Selecione"
                    : "Nenhuma (documento da empresa)"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nenhuma (documento da empresa)</SelectItem>
                {entities?.map((entity) => (
                  <SelectItem key={entity._id} value={entity._id}>
                    {entity.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Vincule a um cliente ou fornecedor, se aplicavel
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descricao</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Descricao ou observacoes sobre o documento..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Dates */}
      <Card>
        <CardHeader>
          <CardTitle>Datas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="issueDate">Data de emissao</Label>
              <Input
                id="issueDate"
                type="date"
                {...register("issueDate")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expirationDate">Data de validade</Label>
              <Input
                id="expirationDate"
                type="date"
                {...register("expirationDate")}
              />
              <p className="text-xs text-muted-foreground">
                Voce sera notificado quando o documento estiver proximo do vencimento
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tags */}
      <Card>
        <CardHeader>
          <CardTitle>Tags</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              {...register("tags")}
              placeholder="Separe as tags por virgula (ex: juridico, 2024, importante)"
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/documents")}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === "create" ? "Criar Documento" : "Salvar Alteracoes"}
        </Button>
      </div>
    </form>
  );
}
