"use client";

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CashFlowChart } from "@/components/financial/cash-flow-chart";
import { EmptyState } from "@/components/layout/empty-state";
import { TrendingUp, TrendingDown, ArrowUpDown, Calendar } from "lucide-react";
import { formatCurrency } from "@/convex/lib/financialValidators";

type DateRange = "week" | "month" | "quarter";

function getDateRange(range: DateRange): { start: number; end: number } {
  const now = new Date();
  const end = now.getTime();
  let start: Date;

  switch (range) {
    case "week":
      start = new Date(now);
      start.setDate(start.getDate() - 7);
      break;
    case "month":
      start = new Date(now);
      start.setMonth(start.getMonth() - 1);
      break;
    case "quarter":
      start = new Date(now);
      start.setMonth(start.getMonth() - 3);
      break;
  }

  return { start: start.getTime(), end };
}

export default function CashFlowPage() {
  const [range, setRange] = useState<DateRange>("month");
  const [showProjected, setShowProjected] = useState(true);

  const dateRange = useMemo(() => getDateRange(range), [range]);

  const cashFlow = useQuery(api.transactions.queries.getCashFlow, {
    startDate: dateRange.start,
    endDate: dateRange.end,
    includeProjected: showProjected,
  });

  const rangeLabels: Record<DateRange, string> = {
    week: "Última Semana",
    month: "Último Mês",
    quarter: "Último Trimestre",
  };

  if (cashFlow === undefined) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Fluxo de Caixa"
          description="Visualize suas entradas e saídas"
        />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fluxo de Caixa"
        description="Visualize suas entradas e saídas"
        action={
          <div className="flex gap-2">
            <Select value={range} onValueChange={(v) => setRange(v as DateRange)}>
              <SelectTrigger className="w-40">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Última Semana</SelectItem>
                <SelectItem value="month">Último Mês</SelectItem>
                <SelectItem value="quarter">Último Trimestre</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant={showProjected ? "default" : "outline"}
              onClick={() => setShowProjected(!showProjected)}
            >
              {showProjected ? "Com Projeções" : "Apenas Realizados"}
            </Button>
          </div>
        }
      />

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Entradas</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(cashFlow.totalInflow)}
            </p>
            <p className="text-xs text-muted-foreground">{rangeLabels[range]}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Saídas</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(cashFlow.totalOutflow)}
            </p>
            <p className="text-xs text-muted-foreground">{rangeLabels[range]}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Saldo do Período</CardTitle>
            <ArrowUpDown className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p
              className={`text-2xl font-bold ${
                cashFlow.netFlow >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {formatCurrency(cashFlow.netFlow)}
            </p>
            <p className="text-xs text-muted-foreground">
              {cashFlow.netFlow >= 0 ? "Positivo" : "Negativo"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      {cashFlow.days.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Fluxo Diário</CardTitle>
          </CardHeader>
          <CardContent>
            <CashFlowChart data={cashFlow.days} />
          </CardContent>
        </Card>
      ) : (
        <EmptyState
          icon={ArrowUpDown}
          title="Sem movimentações no período"
          description="Não há transações registradas para o período selecionado."
        />
      )}

      {/* Detailed Table */}
      {cashFlow.days.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Detalhamento Diário</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Entradas</TableHead>
                    <TableHead className="text-right">Saídas</TableHead>
                    <TableHead className="text-right">Saldo do Dia</TableHead>
                    <TableHead className="text-right">Saldo Acumulado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cashFlow.days.map((day) => {
                    const dayNet = day.inflow - day.outflow;
                    return (
                      <TableRow key={day.date}>
                        <TableCell className="font-medium">
                          {new Date(day.date).toLocaleDateString("pt-BR", {
                            weekday: "short",
                            day: "2-digit",
                            month: "short",
                          })}
                        </TableCell>
                        <TableCell className="text-right font-mono text-green-600">
                          {day.inflow > 0 ? formatCurrency(day.inflow) : "-"}
                        </TableCell>
                        <TableCell className="text-right font-mono text-red-600">
                          {day.outflow > 0 ? formatCurrency(day.outflow) : "-"}
                        </TableCell>
                        <TableCell
                          className={`text-right font-mono ${
                            dayNet >= 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {formatCurrency(dayNet)}
                        </TableCell>
                        <TableCell
                          className={`text-right font-mono font-medium ${
                            day.balance >= 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {formatCurrency(day.balance)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
