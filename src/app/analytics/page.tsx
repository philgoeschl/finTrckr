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
import { ChartInfoButton } from "@/components/ChartInfoButton";
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
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Drawdown — How far below all-time high
            </CardTitle>
            <ChartInfoButton
              title="Drawdown"
              description="How far your portfolio has fallen from its all-time high at each point in time. A value of −10% means the portfolio was 10% below its peak at that moment."
            />
          </CardHeader>
          <CardContent>
            <DrawdownChart data={drawdownSeries} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Portfolio Composition — Invested Capital vs Gain / Loss
            </CardTitle>
            <ChartInfoButton
              title="Portfolio Composition"
              description="Breaks each snapshot into invested capital and unrealised gain or loss. Green bars show gains stacked on top of capital; red bars show losses eating into it."
            />
          </CardHeader>
          <CardContent>
            <CompositionBarChart data={compositionData} />
          </CardContent>
        </Card>

        {hasDeposits && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Deposit & Withdrawal Timeline
              </CardTitle>
              <ChartInfoButton
                title="Deposit & Withdrawal Timeline"
                description="Each bar is a single deposit (positive) or withdrawal (negative), showing how cash flows have shaped your portfolio over time."
              />
            </CardHeader>
            <CardContent>
              <DepositChart data={depositSeries} />
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Weekly Return Distribution — Deposit-adjusted
            </CardTitle>
            <ChartInfoButton
              title="Weekly Return Distribution"
              description="Groups all weekly returns into buckets to reveal how often gains or losses of different sizes occur. A distribution centred above zero with a tight spread is healthy."
            />
          </CardHeader>
          <CardContent>
            <WeeklyReturnHistogram data={histogram} />
          </CardContent>
        </Card>

        {hasRollingVol && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Rolling 4-Period Volatility — Annualised
              </CardTitle>
              <ChartInfoButton
                title="Rolling 4-Period Volatility"
                description="How much your weekly returns have varied over a rolling 4-week window, annualised. Higher values mean more volatility and risk."
              />
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
