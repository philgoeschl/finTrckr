import { entryInputSchema, EntryInput } from "./validations";

// Maps CSV column names (case-insensitive, trimmed) to our field names.
const COLUMN_MAP: Record<string, keyof EntryInput> = {
  date: "date",
  total: "total",
  "capital w/o gain": "capital",
  capital: "capital",
  gain: "gain",
  "gain in %": "gainPct",
  "gain%": "gainPct",
  gainpct: "gainPct",
  "free cash": "freeCash",
  freecash: "freeCash",
  comment: "comment",
};

export interface ParsedRow {
  rowIndex: number;
  data: EntryInput;
}

export interface ParseError {
  rowIndex: number;
  message: string;
  raw: Record<string, unknown>;
}

export interface ParseResult {
  rows: ParsedRow[];
  errors: ParseError[];
}

function normalizeHeader(header: string): string {
  return header.trim().toLowerCase();
}

function parseDateString(value: string | null | undefined): string | null {
  if (!value?.trim()) return null;
  const t = value.trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(t)) {
    const d = new Date(t);
    if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  }
  // DD.MM.YYYY or DD/MM/YYYY
  const parts = t.split(/[./]/);
  if (parts.length === 3 && parts[2].length === 4) {
    const d = new Date(`${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`);
    if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  }
  return null;
}

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  let s = String(value).trim();
  // Handle negative like "-€ 286.91" or "-5.27%"
  const negative = s.startsWith("-");
  if (negative) s = s.slice(1).trim();
  // Strip currency symbols/prefixes and % suffix
  s = s.replace(/^[€$£¥\s]+/, "").replace(/[%\s]+$/, "");
  // Strip thousands separators (comma)
  s = s.replace(/,/g, "");
  const n = parseFloat(s);
  if (isNaN(n)) return null;
  return negative ? -n : n;
}

// Note: comments containing ";" will be silently truncated — limitation of unquoted CSV.
export function parseCsv(text: string): ParseResult {
  const lines = text.split("\n").map((l) => l.replace(/\r$/, ""));
  const nonEmpty = lines.filter((l) => l.trim() !== "");

  if (nonEmpty.length < 2) return { rows: [], errors: [] };

  const headers = nonEmpty[0].split(";").map(normalizeHeader);
  const rows: ParsedRow[] = [];
  const errors: ParseError[] = [];

  for (let i = 1; i < nonEmpty.length; i++) {
    const cells = nonEmpty[i].split(";");
    const rowObj: Record<string, unknown> = {};
    headers.forEach((h, idx) => {
      rowObj[h] = cells[idx] ?? "";
    });

    if (Object.values(rowObj).every((v) => v === "" || v === null || v === undefined)) {
      continue;
    }

    const mapped: Record<string, unknown> = {};
    for (const [header, value] of Object.entries(rowObj)) {
      const field = COLUMN_MAP[header];
      if (!field) continue;
      mapped[field] = value;
    }

    const rawDate = mapped["date"];
    const isoDate = parseDateString(rawDate as string);
    if (!isoDate) {
      errors.push({
        rowIndex: i + 1,
        message: `Invalid or missing date: "${rawDate}"`,
        raw: rowObj,
      });
      continue;
    }
    mapped["date"] = isoDate;

    for (const field of ["total", "capital", "gain", "gainPct", "freeCash"] as const) {
      if (field in mapped) {
        const num = toNumber(mapped[field]);
        if (num === null && field !== "freeCash") {
          errors.push({
            rowIndex: i + 1,
            message: `Invalid value for "${field}": "${mapped[field]}"`,
            raw: rowObj,
          });
          continue;
        }
        mapped[field] = num;
      }
    }

    const validated = entryInputSchema.safeParse(mapped);
    if (!validated.success) {
      errors.push({
        rowIndex: i + 1,
        message: validated.error.issues.map((e) => e.message).join("; "),
        raw: rowObj,
      });
      continue;
    }

    rows.push({ rowIndex: i + 1, data: validated.data });
  }

  return { rows, errors };
}
