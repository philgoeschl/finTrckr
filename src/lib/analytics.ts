// Analytics — pure functions. All date-aware; no fixed 52-week assumption.

export interface EntryForAnalytics {
  date: string; // ISO YYYY-MM-DD
  total: number;
  capital: number;
  gain: number;
  gainPct: number;
}

// ─── helpers ───────────────────────────────────────────────────────────────

const MS_PER_DAY = 86_400_000;

function parseDateMs(iso: string): number {
  return new Date(iso).getTime();
}

function daysBetween(a: string, b: string): number {
  return Math.abs(parseDateMs(b) - parseDateMs(a)) / MS_PER_DAY;
}

function stdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((s, v) => s + v, 0) / values.length;
  const variance =
    values.reduce((s, v) => s + (v - mean) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

function sortedAsc(entries: EntryForAnalytics[]): EntryForAnalytics[] {
  return [...entries].sort((a, b) => parseDateMs(a.date) - parseDateMs(b.date));
}

// ─── Period Returns ────────────────────────────────────────────────────────
// Deposit-adjusted: capitalDelta is stripped out before computing return.

export interface PeriodReturn {
  date: string;
  return: number; // fraction — e.g. 0.05 = 5 %
  days: number;   // calendar days since previous entry
}

export function computePeriodReturns(
  entries: EntryForAnalytics[]
): PeriodReturn[] {
  const asc = sortedAsc(entries);
  const result: PeriodReturn[] = [];
  for (let i = 1; i < asc.length; i++) {
    const prev = asc[i - 1];
    const curr = asc[i];
    const capitalDelta = curr.capital - prev.capital;
    const r = (curr.total - prev.total - capitalDelta) / prev.total;
    const days = daysBetween(prev.date, curr.date);
    result.push({ date: curr.date, return: r, days });
  }
  return result;
}

// ─── CAGR ─────────────────────────────────────────────────────────────────

export function computeCAGR(entries: EntryForAnalytics[]): number | null {
  if (entries.length < 2) return null;
  const asc = sortedAsc(entries);
  const first = asc[0];
  const last = asc[asc.length - 1];
  if (first.total <= 0) return null;
  const calDays = daysBetween(first.date, last.date);
  if (calDays < 1) return null;
  const years = calDays / 365.25;
  return (last.total / first.total) ** (1 / years) - 1;
}

// ─── Max Drawdown ──────────────────────────────────────────────────────────

export function computeMaxDrawdown(entries: EntryForAnalytics[]): number | null {
  if (entries.length < 2) return null;
  const asc = sortedAsc(entries);
  let peak = asc[0].total;
  let maxDD = 0;
  for (const e of asc) {
    if (e.total > peak) peak = e.total;
    const dd = (peak - e.total) / peak;
    if (dd > maxDD) maxDD = dd;
  }
  return maxDD;
}

// ─── Drawdown Series (for chart) ───────────────────────────────────────────

export interface DrawdownPoint {
  date: string;
  drawdown: number; // always ≤ 0, in percent — e.g. -15.03
}

export function computeDrawdownSeries(
  entries: EntryForAnalytics[]
): DrawdownPoint[] {
  const asc = sortedAsc(entries);
  let peak = 0;
  return asc.map((e) => {
    if (e.total > peak) peak = e.total;
    const dd = peak > 0 ? ((e.total - peak) / peak) * 100 : 0;
    return { date: e.date, drawdown: dd };
  });
}

// ─── Win Rate ──────────────────────────────────────────────────────────────

export function computeWinRate(periodReturns: PeriodReturn[]): number | null {
  if (periodReturns.length === 0) return null;
  const wins = periodReturns.filter((r) => r.return > 0).length;
  return wins / periodReturns.length;
}

// ─── Annualised Volatility ─────────────────────────────────────────────────
// Scales by sqrt(365.25 / avgDaysBetween) — handles irregular gaps.

export function computeAnnualisedVolatility(
  periodReturns: PeriodReturn[]
): number | null {
  if (periodReturns.length < 2) return null;
  const returns = periodReturns.map((r) => r.return);
  const avgDays =
    periodReturns.reduce((s, r) => s + r.days, 0) / periodReturns.length;
  return stdDev(returns) * Math.sqrt(365.25 / avgDays);
}

// ─── Deposit / Withdrawal Series ───────────────────────────────────────────

export interface DepositPoint {
  date: string;
  delta: number; // positive = deposit, negative = withdrawal
}

export function computeDepositSeries(
  entries: EntryForAnalytics[]
): DepositPoint[] {
  const asc = sortedAsc(entries);
  return asc.slice(1).map((e, i) => ({
    date: e.date,
    delta: e.capital - asc[i].capital,
  }));
}

// ─── Return Histogram ──────────────────────────────────────────────────────

export interface HistogramBucket {
  label: string;
  count: number;
  from: number; // percent
  to: number;   // percent
}

const BUCKETS: Array<{ label: string; from: number; to: number }> = [
  { label: "< −10%", from: -Infinity, to: -10 },
  { label: "−10 to −5%", from: -10, to: -5 },
  { label: "−5 to 0%", from: -5, to: 0 },
  { label: "0 to +5%", from: 0, to: 5 },
  { label: "+5 to +10%", from: 5, to: 10 },
  { label: "> +10%", from: 10, to: Infinity },
];

export function computeReturnHistogram(
  periodReturns: PeriodReturn[]
): HistogramBucket[] {
  return BUCKETS.map(({ label, from, to }) => ({
    label,
    from,
    to,
    count: periodReturns.filter((r) => {
      const pct = r.return * 100;
      return pct >= from && pct < to;
    }).length,
  }));
}

// ─── Rolling Volatility ────────────────────────────────────────────────────
// Window is entry-based (not calendar), so missing Sundays are harmless.

export interface RollingVolPoint {
  date: string;
  vol: number; // annualised, as a fraction
}

export function computeRollingVolatility(
  periodReturns: PeriodReturn[],
  windowSize = 4
): RollingVolPoint[] {
  const result: RollingVolPoint[] = [];
  for (let i = windowSize - 1; i < periodReturns.length; i++) {
    const window = periodReturns.slice(i - windowSize + 1, i + 1);
    const returns = window.map((r) => r.return);
    const avgDays = window.reduce((s, r) => s + r.days, 0) / window.length;
    const sd = stdDev(returns);
    result.push({
      date: window[window.length - 1].date,
      vol: sd * Math.sqrt(365.25 / avgDays),
    });
  }
  return result;
}
