"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import type { RollingVolPoint } from "@/lib/analytics";

interface RollingVolatilityChartProps {
  data: RollingVolPoint[];
}

export function RollingVolatilityChart({ data }: RollingVolatilityChartProps) {
  const display = data.map((d) => ({ ...d, volPct: d.vol * 100 }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart
        data={display}
        margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
        <YAxis
          tickFormatter={(v) => `${v.toFixed(0)}%`}
          tick={{ fontSize: 11 }}
          width={44}
        />
        <Tooltip
          formatter={(v) => [`${Number(v).toFixed(1)}%`, "Annualised Vol"]}
          contentStyle={{ fontSize: 12 }}
        />
        <Line
          type="monotone"
          dataKey="volPct"
          stroke="var(--chart-3)"
          strokeWidth={2}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
