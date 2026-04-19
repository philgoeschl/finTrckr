import Papa from "papaparse";

// Accepts number, string, or Prisma Decimal (which has a toNumber() method)
type Numeric = number | string | { toNumber(): number };

function toNum(v: Numeric): number {
  if (typeof v === "object" && "toNumber" in v) return v.toNumber();
  return Number(v);
}

export interface EntryRow {
  id: string;
  date: Date | string;
  total: Numeric;
  capital: Numeric;
  gain: Numeric;
  gainPct: Numeric;
  freeCash: Numeric | null;
  comment: string | null;
  createdAt?: Date | string;
}

export function entriesToCsv(entries: EntryRow[]): string {
  const data = entries.map((e) => ({
    Date:
      typeof e.date === "string"
        ? e.date.slice(0, 10)
        : (e.date as Date).toISOString().slice(0, 10),
    "Invested Capital": toNum(e.capital),
    "Available Cash":
      e.freeCash !== null && e.freeCash !== undefined ? toNum(e.freeCash) : 0,
    Gain: toNum(e.gain),
    "Gain in %": toNum(e.gainPct),
    Comment: e.comment ?? "",
  }));

  return Papa.unparse(data, { newline: "\r\n" });
}
