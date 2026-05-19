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
  const chartData = data.map((d) => ({
    date: d.date,
    base: d.capital + Math.min(0, d.gain),
    gainBar: Math.max(0, d.gain),
    lossBar: Math.max(0, -d.gain),
  }));

  const labelMap: Record<string, string> = {
    base: "Invested Capital",
    gainBar: "Gain",
    lossBar: "Loss",
  };

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
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
            labelMap[name as string] ?? name,
          ]}
        />
        <Legend formatter={(v) => labelMap[v] ?? v} />
        <ReferenceLine y={0} stroke="var(--muted-foreground)" />
        <Bar dataKey="base" stackId="a" fill="var(--chart-2)" radius={0} />
        <Bar dataKey="gainBar" stackId="a" fill="var(--chart-3)" radius={[3, 3, 0, 0]} />
        <Bar dataKey="lossBar" stackId="a" fill="var(--destructive)" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
