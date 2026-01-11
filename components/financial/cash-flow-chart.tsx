"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { formatCurrency } from "@/convex/lib/financialValidators";

interface CashFlowDay {
  date: string;
  inflow: number;
  outflow: number;
  balance: number;
}

interface CashFlowChartProps {
  data: CashFlowDay[];
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export function CashFlowChart({ data }: CashFlowChartProps) {
  // Transform data for the chart - outflow as negative for visualization
  const chartData = data.map((day) => ({
    ...day,
    dateLabel: formatDate(day.date),
    inflowDisplay: day.inflow,
    outflowDisplay: -day.outflow, // Negative for visual clarity
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={chartData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="dateLabel"
          tick={{ fontSize: 12 }}
          className="text-muted-foreground"
        />
        <YAxis
          tickFormatter={(value) =>
            new Intl.NumberFormat("pt-BR", {
              notation: "compact",
              compactDisplay: "short",
              style: "currency",
              currency: "BRL",
            }).format(Math.abs(value))
          }
          tick={{ fontSize: 12 }}
          className="text-muted-foreground"
        />
        <Tooltip
          formatter={(value, name) => {
            const numValue = typeof value === "number" ? value : 0;
            const absValue = Math.abs(numValue);
            const label =
              name === "inflowDisplay"
                ? "Entradas"
                : name === "outflowDisplay"
                  ? "Saídas"
                  : "Saldo";
            return [formatCurrency(absValue), label];
          }}
          labelFormatter={(label) => `Data: ${label}`}
          contentStyle={{
            backgroundColor: "hsl(var(--popover))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius)",
          }}
        />
        <Legend
          formatter={(value) => {
            if (value === "inflowDisplay") return "Entradas";
            if (value === "outflowDisplay") return "Saídas";
            return value;
          }}
        />
        <ReferenceLine y={0} stroke="hsl(var(--border))" />
        <Bar
          dataKey="inflowDisplay"
          fill="hsl(142.1 76.2% 36.3%)"
          radius={[4, 4, 0, 0]}
          name="inflowDisplay"
        />
        <Bar
          dataKey="outflowDisplay"
          fill="hsl(0 84.2% 60.2%)"
          radius={[4, 4, 0, 0]}
          name="outflowDisplay"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
