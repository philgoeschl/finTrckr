export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { TopBar } from "@/components/layout/TopBar";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { SparklineChart } from "@/components/charts/SparklineChart";
import { YearFilter } from "@/components/YearFilter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatEur, formatPct, formatDate } from "@/lib/utils";
import { ChartInfoButton } from "@/components/ChartInfoButton";
import {
  computePeriodReturns,
  computeCAGR,
  computeMaxDrawdown,
  computeWinRate,
  computeAnnualisedVolatility,
} from "@/lib/analytics";

async function getEntries() {
  return prisma.entry.findMany({ orderBy: { date: "desc" } });
}

function computeKpis(entries: Awaited<ReturnType<typeof getEntries>>) {
  if (entries.length === 0) return null;

  const latest = entries[0];
  const previous = entries[1] ?? null;

  const wowTotalDelta = previous
    ? Number(latest.total) - Number(previous.total)
    : null;
  const wowGainPctDelta = previous
    ? Number(latest.gainPct) - Number(previous.gainPct)
    : null;

  const analyticsEntries = entries.map((e) => ({
    date: formatDate(e.date),
    total: Number(e.total),
    capital: Number(e.capital),
    gain: Number(e.gain),
    gainPct: Number(e.gainPct),
  }));

  const periodReturns = computePeriodReturns(analyticsEntries);

  return {
    latestTotal: Number(latest.total),
    latestGain: Number(latest.gain),
    latestGainPct: Number(latest.gainPct),
    latestFreeCash: latest.freeCash !== null ? Number(latest.freeCash) : null,
    latestDate: formatDate(latest.date),
    wowTotalDelta,
    wowGainPctDelta,
    totalWeeks: entries.length,
    cagr: computeCAGR(analyticsEntries),
    maxDrawdown: computeMaxDrawdown(analyticsEntries),
    winRate: computeWinRate(periodReturns),
    annualisedVol: computeAnnualisedVolatility(periodReturns),
  };
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  const { year } = await searchParams;
  const selectedYear = year ? parseInt(year) || null : null;

  const entries = await getEntries();
  const allYears = [...new Set(entries.map((e) => new Date(e.date).getFullYear()))].sort(
    (a, b) => b - a
  );

  const filtered = selectedYear
    ? entries.filter((e) => new Date(e.date).getFullYear() === selectedYear)
    : entries;

  const kpis = computeKpis(filtered);

  const sparklineSource = selectedYear ? filtered.slice().reverse() : entries.slice(0, 12).reverse();
  const sparklineData = sparklineSource.map((e) => ({
    date: formatDate(e.date),
    total: Number(e.total),
  }));
  const sparklineTitle = selectedYear
    ? `Portfolio Value — ${selectedYear}`
    : `Portfolio Value — Last ${sparklineData.length} Weeks`;

  if (!kpis) {
    return (
      <div className="flex flex-1 flex-col">
        <TopBar title="Dashboard" />
        <YearFilter years={allYears} selected={selectedYear} />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground">
            No data yet. Add your first entry in the{" "}
            <a href="/entries" className="underline">
              Entries
            </a>{" "}
            page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <TopBar title="Dashboard" />
      <YearFilter years={allYears} selected={selectedYear} />
      <div className="flex-1 space-y-6 p-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard
            title="Total"
            value={formatEur(kpis.latestTotal)}
            delta={
              kpis.wowTotalDelta !== null
                ? `${kpis.wowTotalDelta >= 0 ? "+" : ""}${formatEur(kpis.wowTotalDelta)} WoW`
                : undefined
            }
            deltaPositive={kpis.wowTotalDelta !== null ? kpis.wowTotalDelta >= 0 : undefined}
            subtitle={`As of ${kpis.latestDate}`}
          />
          <KpiCard
            title="Total Gain"
            value={formatEur(kpis.latestGain)}
            delta={formatPct(kpis.latestGainPct)}
            deltaPositive={kpis.latestGain >= 0}
          />
          <KpiCard
            title="Gain % (WoW)"
            value={formatPct(kpis.latestGainPct)}
            delta={
              kpis.wowGainPctDelta !== null
                ? `${kpis.wowGainPctDelta >= 0 ? "+" : ""}${formatPct(kpis.wowGainPctDelta)} vs prev`
                : undefined
            }
            deltaPositive={kpis.wowGainPctDelta !== null ? kpis.wowGainPctDelta >= 0 : undefined}
          />
          <KpiCard
            title="Available Cash"
            value={kpis.latestFreeCash !== null ? formatEur(kpis.latestFreeCash) : "—"}
            subtitle={`${kpis.totalWeeks} week${kpis.totalWeeks !== 1 ? "s" : ""} tracked`}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard
            title="CAGR"
            value={kpis.cagr !== null ? formatPct(kpis.cagr * 100) : "—"}
            subtitle="Compound annual growth rate"
            deltaPositive={kpis.cagr !== null ? kpis.cagr >= 0 : undefined}
          />
          <KpiCard
            title="Max Drawdown"
            value={kpis.maxDrawdown !== null ? formatPct(kpis.maxDrawdown * 100) : "—"}
            subtitle="Worst peak-to-trough decline"
            deltaPositive={false}
          />
          <KpiCard
            title="Win Rate"
            value={kpis.winRate !== null ? formatPct(kpis.winRate * 100) : "—"}
            subtitle="Periods with positive return"
            deltaPositive={kpis.winRate !== null ? kpis.winRate >= 0.5 : undefined}
          />
          <KpiCard
            title="Annualised Vol"
            value={kpis.annualisedVol !== null ? formatPct(kpis.annualisedVol * 100) : "—"}
            subtitle="Deposit-adjusted, calendar-scaled"
          />
        </div>

        {sparklineData.length > 1 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {sparklineTitle}
              </CardTitle>
              <ChartInfoButton
                title="Portfolio Value"
                description="Shows how your total portfolio value has evolved over the selected period. Each data point is a weekly snapshot."
              />
            </CardHeader>
            <CardContent>
              <SparklineChart data={sparklineData} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
