"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";
import { formatPct } from "@/lib/utils";

interface DataPoint {
  date: string;
  gainPct: number;
}

interface GainPctLineChartProps {
  data: DataPoint[];
}

export function GainPctLineChart({ data }: GainPctLineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 4, right: 16, left: 16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
        <YAxis tickFormatter={(v) => `${Number(v).toFixed(1)} %`} tick={{ fontSize: 11 }} width={70} />
        <Tooltip formatter={(v) => [formatPct(Number(v)), "Gain %"]} />
        <ReferenceLine y={0} stroke="var(--muted-foreground)" strokeDasharray="4 4" />
        <Line
          type="monotone"
          dataKey="gainPct"
          stroke="var(--chart-3)"
          strokeWidth={2}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
