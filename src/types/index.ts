export interface Entry {
  id: string;
  date: string; // ISO date string YYYY-MM-DD
  total: number;
  capital: number;
  gain: number;
  gainPct: number;
  freeCash: number | null;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
  userId: string | null;
}

export interface EntryInput {
  date: string;
  total: number;
  capital: number;
  gain: number;
  gainPct: number;
  freeCash?: number | null;
  comment?: string | null;
}

export interface KpiSummary {
  latestTotal: number | null;
  latestGain: number | null;
  latestGainPct: number | null;
  latestFreeCash: number | null;
  latestDate: string | null;
  wowTotalDelta: number | null;
  wowGainPctDelta: number | null;
  totalWeeks: number;
}

export interface ImportResult {
  imported: number;
  skipped: number;
  errors: { rowIndex: number; message: string }[];
}
