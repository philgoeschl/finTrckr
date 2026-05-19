"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";
import type { DrawdownPoint } from "@/lib/analytics";

interface DrawdownChartProps {
  data: DrawdownPoint[];
}

export function DrawdownChart({ data }: DrawdownChartProps) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="ddGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--destructive)" stopOpacity={0.4} />
            <stop offset="95%" stopColor="var(--destructive)" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
        <YAxis
          tickFormatter={(v) => `${v.toFixed(1)}%`}
          tick={{ fontSize: 11 }}
          width={52}
          domain={["auto", 0]}
        />
        <Tooltip
          formatter={(v) => [`${Number(v).toFixed(2)}%`, "Drawdown"]}
          contentStyle={{ fontSize: 12 }}
        />
        <ReferenceLine y={0} stroke="var(--muted-foreground)" strokeDasharray="4 4" />
        <Area
          type="monotone"
          dataKey="drawdown"
          stroke="var(--destructive)"
          strokeWidth={2}
          fill="url(#ddGrad)"
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
