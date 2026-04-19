import * as XLSX from "xlsx";
import { entryInputSchema, EntryInput } from "./validations";

// Maps spreadsheet column names (case-insensitive, trimmed) to our field names.
const COLUMN_MAP: Record<string, keyof EntryInput> = {
  date: "date",
  total: "total",
  "invested capital": "capital",
  "capital w/o gain": "capital",
  capital: "capital",
  gain: "gain",
  "gain in %": "gainPct",
  "gain%": "gainPct",
  gainpct: "gainPct",
  "available cash": "freeCash",
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

function excelDateToIso(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null;

  // Already a string date
  if (typeof value === "string") {
    const trimmed = value.trim();
    // Try ISO format
    if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
      const d = new Date(trimmed);
      if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
    }
    // Try DD.MM.YYYY or DD/MM/YYYY
    const parts = trimmed.split(/[./\-]/);
    if (parts.length === 3) {
      const [a, b, c] = parts;
      // If year is last (DD.MM.YYYY)
      if (c && c.length === 4) {
        const d = new Date(`${c}-${b.padStart(2, "0")}-${a.padStart(2, "0")}`);
        if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
      }
    }
    return null;
  }

  // Excel serial number
  if (typeof value === "number") {
    const date = XLSX.SSF.parse_date_code(value);
    if (!date) return null;
    const y = date.y;
    const m = String(date.m).padStart(2, "0");
    const d = String(date.d).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return null;
}

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return isNaN(n) ? null : n;
}

export function parseXlsx(buffer: Buffer | ArrayBuffer | Uint8Array): ParseResult {
  const workbook = XLSX.read(buffer, { type: "buffer", cellDates: false });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return { rows: [], errors: [] };

  const sheet = workbook.Sheets[sheetName];
  const raw = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: "",
  }) as unknown[][];

  if (raw.length < 2) return { rows: [], errors: [] };

  const headerRow = raw[0] as unknown[];
  const headers = headerRow.map((h) => normalizeHeader(String(h)));

  const rows: ParsedRow[] = [];
  const errors: ParseError[] = [];

  for (let i = 1; i < raw.length; i++) {
    const rowArr = raw[i] as unknown[];
    const rowObj: Record<string, unknown> = {};
    headers.forEach((h, idx) => {
      rowObj[h] = rowArr[idx];
    });

    // Skip entirely empty rows
    if (Object.values(rowObj).every((v) => v === "" || v === null || v === undefined)) {
      continue;
    }

    const mapped: Record<string, unknown> = {};
    for (const [header, value] of Object.entries(rowObj)) {
      const field = COLUMN_MAP[header];
      if (!field) continue;
      mapped[field] = value;
    }

    // Parse date
    const rawDate = mapped["date"];
    const isoDate = excelDateToIso(rawDate);
    if (!isoDate) {
      errors.push({
        rowIndex: i + 1,
        message: `Invalid or missing date: "${rawDate}"`,
        raw: rowObj,
      });
      continue;
    }
    mapped["date"] = isoDate;

    // Parse numeric fields
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
