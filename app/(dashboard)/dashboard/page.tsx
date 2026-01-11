"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/financial/status-badge";
import {
  Users,
  FileText,
  AlertTriangle,
  Clock,
  TrendingUp,
  Receipt,
  HandCoins,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/convex/lib/financialValidators";

export default function DashboardPage() {
  const entityCounts = useQuery(api.entities.queries.getCounts);
  const documentCounts = useQuery(api.documents.queries.getCounts);
  const expiringDocs = useQuery(api.documents.queries.getExpiring, { days: 30 });

  // Financial queries
  const payableSummary = useQuery(api.transactions.queries.getSummary, {
    type: "payable",
  });
  const receivableSummary = useQuery(api.transactions.queries.getSummary, {
    type: "receivable",
  });
  const upcomingPayables = useQuery(api.transactions.queries.getUpcoming, {
    type: "payable",
    days: 7,
  });
  const upcomingReceivables = useQuery(api.transactions.queries.getUpcoming, {
    type: "receivable",
    days: 7,
  });

  const isLoading =
    entityCounts === undefined ||
    documentCounts === undefined ||
    expiringDocs === undefined;

  const isFinancialLoading =
    payableSummary === undefined || receivableSummary === undefined;

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

      {/* Financial Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">A Pagar</CardTitle>
            <Receipt className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            {isFinancialLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(payableSummary?.totalPending ?? 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {payableSummary?.countOverdue ?? 0} vencidas
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">A Receber</CardTitle>
            <HandCoins className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            {isFinancialLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(receivableSummary?.totalPending ?? 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {receivableSummary?.countOverdue ?? 0} vencidas
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Projetado</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {isFinancialLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div
                  className={`text-2xl font-bold ${
                    (receivableSummary?.totalPending ?? 0) -
                      (payableSummary?.totalPending ?? 0) >=
                    0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {formatCurrency(
                    (receivableSummary?.totalPending ?? 0) -
                      (payableSummary?.totalPending ?? 0)
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Receber - Pagar
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencidas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            {isFinancialLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(
                    (payableSummary?.totalOverdue ?? 0) +
                      (receivableSummary?.totalOverdue ?? 0)
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {(payableSummary?.countOverdue ?? 0) +
                    (receivableSummary?.countOverdue ?? 0)}{" "}
                  transações
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
            <Link href="/payables/new">
              <Button variant="outline">Nova Conta a Pagar</Button>
            </Link>
            <Link href="/receivables/new">
              <Button variant="outline">Nova Conta a Receber</Button>
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

      {/* Upcoming Transactions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Próximos Pagamentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingPayables === undefined ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            ) : upcomingPayables.length > 0 ? (
              <ul className="space-y-3">
                {upcomingPayables.slice(0, 5).map((t) => (
                  <li key={t._id} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/payables/${t._id}`}
                        className="text-sm font-medium hover:underline truncate block"
                      >
                        {t.description}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        Vence em {formatDate(t.dueDate)}
                      </p>
                    </div>
                    <div className="text-right ml-2">
                      <p className="text-sm font-mono font-medium text-red-600">
                        {formatCurrency(t.amount - t.paidAmount)}
                      </p>
                      <StatusBadge status={t.status} className="text-xs" />
                    </div>
                  </li>
                ))}
                {upcomingPayables.length > 5 && (
                  <li className="text-sm text-muted-foreground">
                    +{upcomingPayables.length - 5} mais...
                  </li>
                )}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                Nenhum pagamento nos próximos 7 dias.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HandCoins className="h-4 w-4" />
              Próximos Recebimentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingReceivables === undefined ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            ) : upcomingReceivables.length > 0 ? (
              <ul className="space-y-3">
                {upcomingReceivables.slice(0, 5).map((t) => (
                  <li key={t._id} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/receivables/${t._id}`}
                        className="text-sm font-medium hover:underline truncate block"
                      >
                        {t.description}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        Vence em {formatDate(t.dueDate)}
                      </p>
                    </div>
                    <div className="text-right ml-2">
                      <p className="text-sm font-mono font-medium text-green-600">
                        {formatCurrency(t.amount - t.paidAmount)}
                      </p>
                      <StatusBadge status={t.status} className="text-xs" />
                    </div>
                  </li>
                ))}
                {upcomingReceivables.length > 5 && (
                  <li className="text-sm text-muted-foreground">
                    +{upcomingReceivables.length - 5} mais...
                  </li>
                )}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                Nenhum recebimento nos próximos 7 dias.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
