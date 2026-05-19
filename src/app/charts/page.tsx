export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { TopBar } from "@/components/layout/TopBar";
import { YearFilter } from "@/components/YearFilter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PortfolioAreaChart } from "@/components/charts/PortfolioAreaChart";
import { GainLineChart } from "@/components/charts/GainLineChart";
import { GainPctLineChart } from "@/components/charts/GainPctLineChart";
import { formatDate } from "@/lib/utils";
import { ChartInfoButton } from "@/components/ChartInfoButton";

async function getAllEntries() {
  return prisma.entry.findMany({ orderBy: { date: "asc" } });
}

export default async function ChartsPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  const { year } = await searchParams;
  const selectedYear = year ? parseInt(year) || null : null;

  const allEntries = await getAllEntries();
  const allYears = [...new Set(allEntries.map((e) => new Date(e.date).getFullYear()))].sort(
    (a, b) => b - a
  );

  const entries = selectedYear
    ? allEntries.filter((e) => new Date(e.date).getFullYear() === selectedYear)
    : allEntries;

  if (entries.length < 2) {
    return (
      <div className="flex flex-1 flex-col">
        <TopBar title="Charts" />
        <YearFilter years={allYears} selected={selectedYear} />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground">
            Add at least two entries to see charts.
          </p>
        </div>
      </div>
    );
  }

  const data = entries.map((e) => ({
    date: formatDate(e.date),
    total: Number(e.total),
    capital: Number(e.capital),
    gain: Number(e.gain),
    gainPct: Number(e.gainPct),
  }));

  return (
    <div className="flex flex-1 flex-col">
      <TopBar title="Charts" />
      <YearFilter years={allYears} selected={selectedYear} />
      <div className="flex-1 space-y-6 p-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Portfolio Value vs Capital
            </CardTitle>
            <ChartInfoButton
              title="Portfolio Value vs. Capital"
              description="Compares your total portfolio value against the capital you have actually invested. The gap between the two areas represents your unrealised gain or loss."
            />
          </CardHeader>
          <CardContent>
            <PortfolioAreaChart data={data} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Gain (EUR)
            </CardTitle>
            <ChartInfoButton
              title="Gain (EUR)"
              description="Tracks your absolute gain or loss in euros over time, adjusted for deposits and withdrawals. Values above zero are profit; below zero are a loss."
            />
          </CardHeader>
          <CardContent>
            <GainLineChart data={data} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Gain (%)
            </CardTitle>
            <ChartInfoButton
              title="Gain (%)"
              description="Shows your gain or loss as a percentage of invested capital, deposit-adjusted. Useful for comparing performance regardless of portfolio size."
            />
          </CardHeader>
          <CardContent>
            <GainPctLineChart data={data} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
