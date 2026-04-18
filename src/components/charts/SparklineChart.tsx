"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Tooltip,
  XAxis,
} from "recharts";
import { formatEur } from "@/lib/utils";

interface SparklineChartProps {
  data: { date: string; total: number }[];
}

export function SparklineChart({ data }: SparklineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={120}>
      <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="sparkGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="date" hide />
        <Tooltip
          formatter={(v) => [formatEur(Number(v)), "Total"]}
          labelFormatter={(l) => l}
          contentStyle={{ fontSize: 12 }}
        />
        <Area
          type="monotone"
          dataKey="total"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          fill="url(#sparkGradient)"
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
