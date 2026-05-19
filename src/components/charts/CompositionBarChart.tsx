"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";
import { formatEur } from "@/lib/utils";

interface CompositionPoint {
  date: string;
  capital: number;
  gain: number;
}

interface CompositionBarChartProps {
  data: CompositionPoint[];
}

export function CompositionBarChart({ data }: CompositionBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
        <YAxis
          tickFormatter={(v) => formatEur(v)}
          tick={{ fontSize: 11 }}
          width={72}
        />
        <Tooltip
          formatter={(v, name) => [
            formatEur(Number(v)),
            name === "capital" ? "Invested Capital" : "Gain / Loss",
          ]}
        />
        <Legend
          formatter={(v) =>
            v === "capital" ? "Invested Capital" : "Gain / Loss"
          }
        />
        <ReferenceLine y={0} stroke="var(--muted-foreground)" />
        <Bar dataKey="capital" stackId="a" fill="var(--chart-2)" radius={0} />
        <Bar dataKey="gain" stackId="a" fill="var(--chart-1)" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
