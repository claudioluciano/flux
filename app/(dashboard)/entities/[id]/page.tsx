"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Pencil, FileText } from "lucide-react";
import { formatDocument } from "@/convex/lib/validators";

interface EntityDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function EntityDetailPage({ params }: EntityDetailPageProps) {
  const { id } = use(params);
  const entity = useQuery(api.entities.queries.get, {
    id: id as Id<"entities">,
  });
  const documents = useQuery(api.documents.queries.getByEntity, {
    entityId: id as Id<"entities">,
  });

  if (entity === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (entity === null) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Entidade não encontrada</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={entity.tradeName || entity.name}
        description={entity.tradeName ? entity.name : undefined}
        action={
          <Link href={`/entities/${id}/edit`}>
            <Button>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </Button>
          </Link>
        }
      />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              {entity.isClient && <Badge variant="default">Cliente</Badge>}
              {entity.isSupplier && <Badge variant="secondary">Fornecedor</Badge>}
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                {entity.entityType === "company" ? "CNPJ" : "CPF"}
              </p>
              <p className="font-mono">
                {formatDocument(entity.document, entity.entityType)}
              </p>
            </div>

            {entity.stateRegistration && (
              <div>
                <p className="text-sm text-muted-foreground">Inscrição Estadual</p>
                <p>{entity.stateRegistration}</p>
              </div>
            )}

            {entity.municipalRegistration && (
              <div>
                <p className="text-sm text-muted-foreground">
                  Inscrição Municipal
                </p>
                <p>{entity.municipalRegistration}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card>
          <CardHeader>
            <CardTitle>Contato</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {entity.email && (
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <a href={`mailto:${entity.email}`} className="hover:underline">
                  {entity.email}
                </a>
              </div>
            )}

            {entity.phone && (
              <div>
                <p className="text-sm text-muted-foreground">Telefone</p>
                <a href={`tel:${entity.phone}`} className="hover:underline">
                  {entity.phone}
                </a>
              </div>
            )}

            {entity.website && (
              <div>
                <p className="text-sm text-muted-foreground">Website</p>
                <a
                  href={entity.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {entity.website}
                </a>
              </div>
            )}

            {!entity.email && !entity.phone && !entity.website && (
              <p className="text-muted-foreground">
                Nenhuma informação de contato
              </p>
            )}
          </CardContent>
        </Card>

        {/* Address */}
        {entity.address && (
          <Card>
            <CardHeader>
              <CardTitle>Endereço</CardTitle>
            </CardHeader>
            <CardContent>
              <address className="not-italic">
                <p>
                  {entity.address.street}, {entity.address.number}
                  {entity.address.complement && ` - ${entity.address.complement}`}
                </p>
                <p>
                  {entity.address.neighborhood} - {entity.address.city}/
                  {entity.address.state}
                </p>
                <p>CEP: {entity.address.zipCode}</p>
              </address>
            </CardContent>
          </Card>
        )}

        {/* Notes */}
        {entity.notes && (
          <Card>
            <CardHeader>
              <CardTitle>Observações</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{entity.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Related Documents */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Documentos Vinculados</CardTitle>
          <Link href={`/documents/new?entityId=${id}`}>
            <Button variant="outline" size="sm">
              <FileText className="mr-2 h-4 w-4" />
              Adicionar Documento
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {documents === undefined ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : documents.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              Nenhum documento vinculado a esta entidade
            </p>
          ) : (
            <ul className="divide-y">
              {documents.map((doc) => (
                <li key={doc._id} className="py-2">
                  <Link
                    href={`/documents/${doc._id}`}
                    className="flex items-center justify-between hover:bg-muted/50 -mx-2 px-2 py-1 rounded-md"
                  >
                    <div>
                      <p className="font-medium">{doc.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {doc.category}
                      </p>
                    </div>
                    {doc.expirationDate && (
                      <span className="text-sm text-muted-foreground">
                        Vence:{" "}
                        {new Date(doc.expirationDate).toLocaleDateString("pt-BR")}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
