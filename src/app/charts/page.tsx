export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { TopBar } from "@/components/layout/TopBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PortfolioAreaChart } from "@/components/charts/PortfolioAreaChart";
import { GainLineChart } from "@/components/charts/GainLineChart";
import { GainPctLineChart } from "@/components/charts/GainPctLineChart";
import { formatDate } from "@/lib/utils";

async function getAllEntries() {
  return prisma.entry.findMany({ orderBy: { date: "asc" } });
}

export default async function ChartsPage() {
  const entries = await getAllEntries();

  if (entries.length < 2) {
    return (
      <div className="flex flex-1 flex-col">
        <TopBar title="Charts" />
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
      <div className="flex-1 space-y-6 p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Portfolio Value vs Capital
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PortfolioAreaChart data={data} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Gain (EUR)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <GainLineChart data={data} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Gain (%)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <GainPctLineChart data={data} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
