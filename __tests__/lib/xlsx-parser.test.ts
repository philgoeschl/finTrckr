import { describe, it, expect } from "vitest";
import * as XLSX from "xlsx";
import { parseXlsx } from "@/lib/xlsx-parser";

function makeXlsx(rows: unknown[][]): Uint8Array {
  const ws = XLSX.utils.aoa_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Uint8Array;
}

const HEADERS = ["Date", "Total", "Capital w/o Gain", "Gain", "Gain in %", "Comment"];
const HEADERS_WITH_FREE_CASH = ["Date", "Total", "Capital w/o Gain", "Gain", "Gain in %", "Free Cash", "Comment"];

describe("parseXlsx", () => {
  it("parses a valid sheet with all columns", () => {
    const buf = makeXlsx([
      HEADERS,
      ["2024-01-07", 10000, 8000, 2000, 25, "First week"],
    ]);
    const result = parseXlsx(buf);
    expect(result.errors).toHaveLength(0);
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].data.total).toBe(10000);
    expect(result.rows[0].data.date).toBe("2024-01-07");
    expect(result.rows[0].data.comment).toBe("First week");
  });

  it("handles missing Free Cash column gracefully (freeCash is null)", () => {
    const buf = makeXlsx([
      HEADERS,
      ["2024-01-07", 10000, 8000, 2000, 25, "no free cash col"],
    ]);
    const result = parseXlsx(buf);
    expect(result.errors).toHaveLength(0);
    expect(result.rows[0].data.freeCash).toBeNull();
  });

  it("parses Free Cash column when present", () => {
    const buf = makeXlsx([
      HEADERS_WITH_FREE_CASH,
      ["2024-01-07", 10000, 8000, 2000, 25, 500, "with free cash"],
    ]);
    const result = parseXlsx(buf);
    expect(result.errors).toHaveLength(0);
    expect(result.rows[0].data.freeCash).toBe(500);
  });

  it("is case-insensitive on column headers", () => {
    const buf = makeXlsx([
      ["date", "total", "capital w/o gain", "gain", "gain in %", "comment"],
      ["2024-01-07", 10000, 8000, 2000, 25, "lowercase headers"],
    ]);
    const result = parseXlsx(buf);
    expect(result.errors).toHaveLength(0);
    expect(result.rows).toHaveLength(1);
  });

  it("trims whitespace from headers", () => {
    const buf = makeXlsx([
      ["  Date  ", "  Total  ", "Capital w/o Gain", "Gain", "Gain in %", "Comment"],
      ["2024-01-07", 10000, 8000, 2000, 25, "trimmed"],
    ]);
    const result = parseXlsx(buf);
    expect(result.errors).toHaveLength(0);
    expect(result.rows).toHaveLength(1);
  });

  it("adds invalid date rows to errors, not to rows", () => {
    const buf = makeXlsx([
      HEADERS,
      ["not-a-date", 10000, 8000, 2000, 25, "bad date"],
    ]);
    const result = parseXlsx(buf);
    expect(result.rows).toHaveLength(0);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].message).toMatch(/date/i);
  });

  it("adds non-numeric Total rows to errors", () => {
    const buf = makeXlsx([
      HEADERS,
      ["2024-01-07", "not-a-number", 8000, 2000, 25, "bad total"],
    ]);
    const result = parseXlsx(buf);
    expect(result.rows).toHaveLength(0);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("returns empty result for a sheet with only headers", () => {
    const buf = makeXlsx([HEADERS]);
    const result = parseXlsx(buf);
    expect(result.rows).toHaveLength(0);
    expect(result.errors).toHaveLength(0);
  });

  it("returns empty result for an empty sheet", () => {
    const buf = makeXlsx([]);
    const result = parseXlsx(buf);
    expect(result.rows).toHaveLength(0);
    expect(result.errors).toHaveLength(0);
  });

  it("skips completely empty rows", () => {
    const buf = makeXlsx([
      HEADERS,
      ["2024-01-07", 10000, 8000, 2000, 25, "valid"],
      ["", "", "", "", "", ""],
      ["2024-01-14", 10500, 8000, 2500, 31.25, "also valid"],
    ]);
    const result = parseXlsx(buf);
    expect(result.rows).toHaveLength(2);
    expect(result.errors).toHaveLength(0);
  });

  it("handles mixed valid and invalid rows", () => {
    const buf = makeXlsx([
      HEADERS,
      ["2024-01-07", 10000, 8000, 2000, 25, "valid"],
      ["bad-date", 10000, 8000, 2000, 25, "invalid"],
      ["2024-01-21", 11000, 8000, 3000, 37.5, "valid again"],
    ]);
    const result = parseXlsx(buf);
    expect(result.rows).toHaveLength(2);
    expect(result.errors).toHaveLength(1);
  });

  it("parses negative gain values", () => {
    const buf = makeXlsx([
      HEADERS,
      ["2024-01-07", 7500, 8000, -500, -6.25, "loss week"],
    ]);
    const result = parseXlsx(buf);
    expect(result.errors).toHaveLength(0);
    expect(result.rows[0].data.gain).toBe(-500);
    expect(result.rows[0].data.gainPct).toBe(-6.25);
  });
});
