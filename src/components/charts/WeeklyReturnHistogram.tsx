"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import type { HistogramBucket } from "@/lib/analytics";

interface WeeklyReturnHistogramProps {
  data: HistogramBucket[];
}

export function WeeklyReturnHistogram({ data }: WeeklyReturnHistogramProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 11 }}
          width={32}
          label={{ value: "Weeks", angle: -90, position: "insideLeft", fontSize: 11, dy: 30 }}
        />
        <Tooltip
          formatter={(v) => [v, "Weeks"]}
          contentStyle={{ fontSize: 12 }}
        />
        <Bar dataKey="count" radius={[3, 3, 0, 0]}>
          {data.map((bucket, i) => (
            <Cell
              key={i}
              fill={bucket.from >= 0 ? "var(--chart-1)" : "var(--destructive)"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
