"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, FileText, AlertTriangle, Clock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const entityCounts = useQuery(api.entities.queries.getCounts);
  const documentCounts = useQuery(api.documents.queries.getCounts);
  const expiringDocs = useQuery(api.documents.queries.getExpiring, { days: 30 });

  const isLoading =
    entityCounts === undefined ||
    documentCounts === undefined ||
    expiringDocs === undefined;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Visão geral do seu negócio"
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Entidades</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{entityCounts.total}</div>
                <p className="text-xs text-muted-foreground">
                  {entityCounts.clients} clientes, {entityCounts.suppliers}{" "}
                  fornecedores
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documentos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{documentCounts.total}</div>
                <p className="text-xs text-muted-foreground">
                  Em {Object.keys(documentCounts.byCategory).length} categorias
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documentos Vencidos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold text-destructive">
                  {documentCounts.expired}
                </div>
                <p className="text-xs text-muted-foreground">
                  Requer atenção imediata
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencendo em 30 dias</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold text-yellow-500">
                  {documentCounts.expiringSoon}
                </div>
                <p className="text-xs text-muted-foreground">
                  Nos próximos 30 dias
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Link href="/entities/new">
              <Button>Nova Entidade</Button>
            </Link>
            <Link href="/documents/new">
              <Button variant="outline">Novo Documento</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Documentos a Vencer</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            ) : expiringDocs && expiringDocs.length > 0 ? (
              <ul className="space-y-2">
                {expiringDocs.slice(0, 5).map((doc) => (
                  <li key={doc._id} className="flex items-center justify-between text-sm">
                    <span className="truncate">{doc.name}</span>
                    <span className="text-muted-foreground">
                      {doc.expirationDate
                        ? new Date(doc.expirationDate).toLocaleDateString("pt-BR")
                        : "-"}
                    </span>
                  </li>
                ))}
                {expiringDocs.length > 5 && (
                  <li className="text-sm text-muted-foreground">
                    +{expiringDocs.length - 5} mais...
                  </li>
                )}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                Nenhum documento a vencer nos próximos 30 dias.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
