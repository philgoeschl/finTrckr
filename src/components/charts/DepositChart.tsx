"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Cell,
} from "recharts";
import { formatEur } from "@/lib/utils";
import type { DepositPoint } from "@/lib/analytics";

interface DepositChartProps {
  data: DepositPoint[];
}

export function DepositChart({ data }: DepositChartProps) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
        <YAxis
          tickFormatter={(v) => formatEur(v)}
          tick={{ fontSize: 11 }}
          width={72}
        />
        <Tooltip
          formatter={(v) => [
            formatEur(Number(v)),
            Number(v) >= 0 ? "Deposit" : "Withdrawal",
          ]}
          contentStyle={{ fontSize: 12 }}
        />
        <ReferenceLine y={0} stroke="var(--muted-foreground)" />
        <Bar dataKey="delta" radius={[3, 3, 0, 0]}>
          {data.map((entry, i) => (
            <Cell
              key={i}
              fill={entry.delta >= 0 ? "var(--chart-1)" : "var(--destructive)"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
