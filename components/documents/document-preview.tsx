"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Download,
  ExternalLink,
  FileText,
  ImageIcon,
  FileSpreadsheet,
  File,
} from "lucide-react";

interface DocumentPreviewProps {
  documentId: Id<"documents">;
  fileName: string;
  fileType: string;
  className?: string;
}

export function DocumentPreview({
  documentId,
  fileName,
  fileType,
  className,
}: DocumentPreviewProps) {
  const downloadData = useQuery(api.documents.queries.getDownloadUrl, {
    id: documentId,
  });

  const url = downloadData?.url || null;
  const loading = downloadData === undefined;
  const error = downloadData === null ? "Nao foi possivel carregar o arquivo" : null;

  const isPDF = fileType === "application/pdf";
  const isImage = fileType.startsWith("image/");
  const isExcel =
    fileType.includes("spreadsheet") || fileType.includes("excel");
  const isWord =
    fileType.includes("word") || fileType.includes("document");

  const handleDownload = () => {
    if (!url) return;
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenInNewTab = () => {
    if (url) {
      window.open(url, "_blank");
    }
  };

  const getFileIcon = () => {
    if (isPDF) return FileText;
    if (isImage) return ImageIcon;
    if (isExcel) return FileSpreadsheet;
    return File;
  };

  const FileIcon = getFileIcon();

  if (loading) {
    return (
      <div className={cn("space-y-4", className)}>
        <Skeleton className="h-[400px] w-full" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    );
  }

  if (error || !url) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center",
          className
        )}
      >
        <FileIcon className="h-16 w-16 text-muted-foreground" />
        <p className="mt-4 text-sm font-medium">{fileName}</p>
        <p className="mt-1 text-xs text-destructive">{error || "Arquivo indisponivel"}</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Preview Area */}
      <div className="rounded-lg border bg-muted/20 overflow-hidden">
        {isPDF ? (
          <iframe
            src={`${url}#toolbar=1&navpanes=0`}
            className="h-[600px] w-full"
            title={fileName}
          />
        ) : isImage ? (
          <div className="flex items-center justify-center p-4 bg-checkerboard">
            <img
              src={url}
              alt={fileName}
              className="max-h-[600px] max-w-full object-contain"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-16">
            <FileIcon className="h-24 w-24 text-muted-foreground" />
            <p className="mt-4 text-lg font-medium">{fileName}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {isWord
                ? "Documento Word"
                : isExcel
                  ? "Planilha Excel"
                  : "Arquivo"}
            </p>
            <p className="mt-4 text-xs text-muted-foreground">
              Visualizacao nao disponivel para este tipo de arquivo
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <Button onClick={handleDownload} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Baixar arquivo
        </Button>
        {(isPDF || isImage) && (
          <Button onClick={handleOpenInNewTab} variant="outline">
            <ExternalLink className="mr-2 h-4 w-4" />
            Abrir em nova aba
          </Button>
        )}
      </div>
    </div>
  );
}
