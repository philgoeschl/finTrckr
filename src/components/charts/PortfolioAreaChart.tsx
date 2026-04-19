"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { formatEur } from "@/lib/utils";

interface DataPoint {
  date: string;
  total: number;
  capital: number;
}

interface PortfolioAreaChartProps {
  data: DataPoint[];
}

export function PortfolioAreaChart({ data }: PortfolioAreaChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 4, right: 16, left: 16, bottom: 0 }}>
        <defs>
          <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.4} />
            <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0.05} />
          </linearGradient>
          <linearGradient id="capitalGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
        <YAxis tickFormatter={(v) => formatEur(v)} tick={{ fontSize: 11 }} width={90} />
        <Tooltip formatter={(v, name) => [formatEur(Number(v)), name === "total" ? "Total" : "Capital w/o Gain"]} />
        <Legend formatter={(v) => (v === "total" ? "Total" : "Capital w/o Gain")} />
        <Area
          type="monotone"
          dataKey="capital"
          stroke="var(--chart-2)"
          strokeWidth={2}
          fill="url(#capitalGrad)"
        />
        <Area
          type="monotone"
          dataKey="total"
          stroke="var(--chart-1)"
          strokeWidth={2}
          fill="url(#totalGrad)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
