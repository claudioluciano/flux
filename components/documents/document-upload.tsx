"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FileUp, Loader2, X, CheckCircle, AlertCircle } from "lucide-react";

interface UploadedFile {
  storageId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
}

interface DocumentUploadProps {
  onUploadComplete: (file: UploadedFile) => void;
  accept?: Record<string, string[]>;
  maxSize?: number;
  className?: string;
}

const DEFAULT_ACCEPT = {
  "application/pdf": [".pdf"],
  "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "application/vnd.ms-excel": [".xls"],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
};

const DEFAULT_MAX_SIZE = 10 * 1024 * 1024; // 10MB

export function DocumentUpload({
  onUploadComplete,
  accept = DEFAULT_ACCEPT,
  maxSize = DEFAULT_MAX_SIZE,
  className,
}: DocumentUploadProps) {
  const [uploadState, setUploadState] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const generateUploadUrl = useMutation(api.documents.mutations.generateUploadUrl);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setUploadState("uploading");
      setProgress(0);
      setError(null);
      setUploadedFileName(file.name);

      try {
        // Get upload URL from Convex
        setProgress(10);
        const uploadUrl = await generateUploadUrl();

        // Upload file to Convex storage
        setProgress(30);
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: {
            "Content-Type": file.type,
          },
          body: file,
        });

        if (!result.ok) {
          throw new Error("Falha no upload do arquivo");
        }

        setProgress(80);
        const { storageId } = await result.json();

        setProgress(100);
        setUploadState("success");

        onUploadComplete({
          storageId,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
        });
      } catch (err) {
        setUploadState("error");
        setError(err instanceof Error ? err.message : "Erro ao fazer upload");
      }
    },
    [generateUploadUrl, onUploadComplete]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      accept,
      maxSize,
      maxFiles: 1,
      disabled: uploadState === "uploading",
    });

  const reset = () => {
    setUploadState("idle");
    setProgress(0);
    setError(null);
    setUploadedFileName(null);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className={className}>
      {uploadState === "idle" && (
        <div
          {...getRootProps()}
          className={cn(
            "cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors",
            isDragActive
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
          )}
        >
          <input {...getInputProps()} />
          <FileUp className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-2 text-sm font-medium">
            {isDragActive
              ? "Solte o arquivo aqui..."
              : "Arraste um arquivo ou clique para selecionar"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            PDF, imagens, Word, Excel (max {formatSize(maxSize)})
          </p>
        </div>
      )}

      {uploadState === "uploading" && (
        <div className="rounded-lg border p-8 text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <p className="mt-2 text-sm font-medium">Enviando arquivo...</p>
          <p className="text-xs text-muted-foreground">{uploadedFileName}</p>
          <Progress value={progress} className="mt-4" />
        </div>
      )}

      {uploadState === "success" && (
        <div className="rounded-lg border border-green-500 bg-green-50 p-8 text-center dark:bg-green-950">
          <CheckCircle className="mx-auto h-12 w-12 text-green-600 dark:text-green-400" />
          <p className="mt-2 text-sm font-medium text-green-700 dark:text-green-300">
            Arquivo enviado com sucesso!
          </p>
          <p className="text-xs text-green-600 dark:text-green-400">
            {uploadedFileName}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={reset}
          >
            Enviar outro arquivo
          </Button>
        </div>
      )}

      {uploadState === "error" && (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-8 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
          <p className="mt-2 text-sm font-medium text-destructive">
            Erro no upload
          </p>
          <p className="text-xs text-destructive">{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={reset}
          >
            Tentar novamente
          </Button>
        </div>
      )}

      {fileRejections.length > 0 && uploadState === "idle" && (
        <div className="mt-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {fileRejections[0].errors.map((e) => (
            <p key={e.code}>
              {e.code === "file-too-large"
                ? `Arquivo muito grande (max ${formatSize(maxSize)})`
                : e.code === "file-invalid-type"
                  ? "Tipo de arquivo nao permitido"
                  : e.message}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
