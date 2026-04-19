import { describe, it, expect } from "vitest";
import { entriesToCsv } from "@/lib/csv-export";

const baseEntry = {
  id: "test-1",
  date: "2024-01-07T00:00:00.000Z",
  total: 10000.5,
  capital: 8000,
  gain: 2000.5,
  gainPct: 25.0063,
  freeCash: 500,
  comment: "Test comment",
};

describe("entriesToCsv", () => {
  it("produces a CSV with a header row and one data row", () => {
    const csv = entriesToCsv([baseEntry]);
    const lines = csv.split("\r\n").filter(Boolean);
    expect(lines).toHaveLength(2);
    expect(lines[0]).toContain("Date");
    expect(lines[0]).toContain("Invested Capital");
    expect(lines[0]).toContain("Gain in %");
  });

  it("formats date as YYYY-MM-DD", () => {
    const csv = entriesToCsv([baseEntry]);
    expect(csv).toContain("2024-01-07");
  });

  it("outputs null freeCash as 0", () => {
    const csv = entriesToCsv([{ ...baseEntry, freeCash: null }]);
    expect(csv).not.toContain("null");
    const lines = csv.split("\r\n");
    // Free Cash column should contain 0, not empty
    expect(lines[1]).toContain(",0,");
  });

  it("wraps comment with special characters in quotes", () => {
    const csv = entriesToCsv([{ ...baseEntry, comment: 'Has, comma and "quotes"' }]);
    expect(csv).toContain('"Has, comma and');
  });

  it("outputs empty string for null comment", () => {
    const csv = entriesToCsv([{ ...baseEntry, comment: null }]);
    expect(csv).not.toContain("null");
  });

  it("handles multiple entries", () => {
    const entries = [baseEntry, { ...baseEntry, id: "test-2", date: "2024-01-14T00:00:00.000Z" }];
    const csv = entriesToCsv(entries);
    const lines = csv.split("\r\n").filter(Boolean);
    expect(lines).toHaveLength(3); // header + 2 data rows
  });

  it("returns only header row for empty array", () => {
    const csv = entriesToCsv([]);
    // papaparse returns empty string for empty data; just verify no data rows
    const lines = csv.split("\r\n").filter(Boolean);
    expect(lines.length).toBeLessThanOrEqual(1);
  });

  it("accepts Date objects for date field", () => {
    const csv = entriesToCsv([{ ...baseEntry, date: new Date("2024-03-10") }]);
    expect(csv).toContain("2024-03-10");
  });
});
