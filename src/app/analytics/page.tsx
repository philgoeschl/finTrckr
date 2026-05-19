export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { TopBar } from "@/components/layout/TopBar";
import { YearFilter } from "@/components/YearFilter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DrawdownChart } from "@/components/charts/DrawdownChart";
import { CompositionBarChart } from "@/components/charts/CompositionBarChart";
import { DepositChart } from "@/components/charts/DepositChart";
import { WeeklyReturnHistogram } from "@/components/charts/WeeklyReturnHistogram";
import { RollingVolatilityChart } from "@/components/charts/RollingVolatilityChart";
import { formatDate } from "@/lib/utils";
import {
  computePeriodReturns,
  computeDrawdownSeries,
  computeDepositSeries,
  computeReturnHistogram,
  computeRollingVolatility,
} from "@/lib/analytics";

async function getEntries() {
  return prisma.entry.findMany({ orderBy: { date: "asc" } });
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  const { year } = await searchParams;
  const selectedYear = year ? parseInt(year) || null : null;

  const allRaw = await getEntries();
  const allYears = [...new Set(allRaw.map((e) => new Date(e.date).getFullYear()))].sort(
    (a, b) => b - a
  );

  const raw = selectedYear
    ? allRaw.filter((e) => new Date(e.date).getFullYear() === selectedYear)
    : allRaw;

  if (raw.length < 2) {
    return (
      <div className="flex flex-1 flex-col">
        <TopBar title="Analytics" />
        <YearFilter years={allYears} selected={selectedYear} />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground">
            Add at least 2 entries to see analytics.
          </p>
        </div>
      </div>
    );
  }

  const entries = raw.map((e) => ({
    date: formatDate(e.date),
    total: Number(e.total),
    capital: Number(e.capital),
    gain: Number(e.gain),
    gainPct: Number(e.gainPct),
  }));

  const periodReturns = computePeriodReturns(entries);
  const drawdownSeries = computeDrawdownSeries(entries);
  const depositSeries = computeDepositSeries(entries);
  const histogram = computeReturnHistogram(periodReturns);
  const rollingVol = computeRollingVolatility(periodReturns);

  const compositionData = entries.map((e) => ({
    date: e.date,
    capital: e.capital,
    gain: e.gain,
  }));

  const hasDeposits = depositSeries.some((d) => d.delta !== 0);
  const hasRollingVol = rollingVol.length > 0;

  return (
    <div className="flex flex-1 flex-col">
      <TopBar title="Analytics" />
      <YearFilter years={allYears} selected={selectedYear} />
      <div className="flex-1 space-y-6 p-6">

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Drawdown — How far below all-time high
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DrawdownChart data={drawdownSeries} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Portfolio Composition — Invested Capital vs Gain / Loss
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CompositionBarChart data={compositionData} />
          </CardContent>
        </Card>

        {hasDeposits && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Deposit & Withdrawal Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DepositChart data={depositSeries} />
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Weekly Return Distribution — Deposit-adjusted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <WeeklyReturnHistogram data={histogram} />
          </CardContent>
        </Card>

        {hasRollingVol && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Rolling 4-Period Volatility — Annualised
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RollingVolatilityChart data={rollingVol} />
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}
