import { describe, it, expect } from "vitest";
import { parseCsv } from "@/lib/csv-parser";

const H   = "Date;Total;Invested Capital;Gain;Gain in %";
const HC  = "Date;Total;Invested Capital;Gain;Gain in %;Comment";
const HFC = "Date;Total;Invested Capital;Gain;Gain in %;Available Cash;Comment";

describe("parseCsv", () => {
  it("parses a valid CSV with all columns", () => {
    const result = parseCsv(`${HC}\n2024-01-07;10000;8000;2000;25;First week`);
    expect(result.errors).toHaveLength(0);
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].data.total).toBe(10000);
    expect(result.rows[0].data.date).toBe("2024-01-07");
    expect(result.rows[0].data.comment).toBe("First week");
  });

  it("handles missing Available Cash column gracefully (freeCash is null)", () => {
    const result = parseCsv(`${HC}\n2024-01-07;10000;8000;2000;25;no available cash col`);
    expect(result.errors).toHaveLength(0);
    expect(result.rows[0].data.freeCash).toBeNull();
  });

  it("parses Available Cash column when present", () => {
    const result = parseCsv(`${HFC}\n2024-01-07;10000;8000;2000;25;500;with available cash`);
    expect(result.errors).toHaveLength(0);
    expect(result.rows[0].data.freeCash).toBe(500);
  });

  it("is case-insensitive on column headers", () => {
    const result = parseCsv(
      "date;total;capital w/o gain;gain;gain in %;comment\n2024-01-07;10000;8000;2000;25;lowercase"
    );
    expect(result.errors).toHaveLength(0);
    expect(result.rows).toHaveLength(1);
  });

  it("trims whitespace from headers", () => {
    const result = parseCsv(
      "  Date  ;  Total  ;Capital w/o Gain;Gain;Gain in %;Comment\n2024-01-07;10000;8000;2000;25;trimmed"
    );
    expect(result.errors).toHaveLength(0);
    expect(result.rows).toHaveLength(1);
  });

  it("adds invalid date rows to errors, not to rows", () => {
    const result = parseCsv(`${HC}\nnot-a-date;10000;8000;2000;25;bad date`);
    expect(result.rows).toHaveLength(0);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].message).toMatch(/date/i);
  });

  it("recovers non-numeric Total by deriving it from capital + freeCash", () => {
    const result = parseCsv(`${HC}\n2024-01-07;not-a-number;8000;2000;25;bad total`);
    expect(result.errors).toHaveLength(0);
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].data.total).toBe(8000); // 8000 + 0 (no freeCash)
  });

  it("returns empty result for a CSV with only headers", () => {
    const result = parseCsv(HC);
    expect(result.rows).toHaveLength(0);
    expect(result.errors).toHaveLength(0);
  });

  it("returns empty result for empty input", () => {
    const result = parseCsv("");
    expect(result.rows).toHaveLength(0);
    expect(result.errors).toHaveLength(0);
  });

  it("skips completely empty rows", () => {
    const result = parseCsv(
      `${HC}\n2024-01-07;10000;8000;2000;25;valid\n;;;;;\n2024-01-14;10500;8000;2500;31.25;also valid`
    );
    expect(result.rows).toHaveLength(2);
    expect(result.errors).toHaveLength(0);
  });

  it("handles mixed valid and invalid rows", () => {
    const result = parseCsv(
      `${HC}\n2024-01-07;10000;8000;2000;25;valid\nbad-date;10000;8000;2000;25;invalid\n2024-01-21;11000;8000;3000;37.5;valid again`
    );
    expect(result.rows).toHaveLength(2);
    expect(result.errors).toHaveLength(1);
  });

  it("parses negative gain values in European format", () => {
    const result = parseCsv(`${HC}\n2024-01-07;€ 7,500.00;€ 8,000.00;-€ 500.00;-6.25%;loss week`);
    expect(result.errors).toHaveLength(0);
    expect(result.rows[0].data.gain).toBe(-500);
    expect(result.rows[0].data.gainPct).toBe(-6.25);
  });

  it("handles CRLF line endings", () => {
    const result = parseCsv(`${HC}\r\n2024-01-07;10000;8000;2000;25;crlf`);
    expect(result.errors).toHaveLength(0);
    expect(result.rows).toHaveLength(1);
  });

  it("parses DD.MM.YYYY date format", () => {
    const result = parseCsv(`${HC}\n07.01.2024;10000;8000;2000;25;dd.mm.yyyy`);
    expect(result.errors).toHaveLength(0);
    expect(result.rows[0].data.date).toBe("2024-01-07");
  });

  it("strips currency prefix from numeric fields", () => {
    const result = parseCsv(
      `${HC}\n2024-01-07;€ 8,751.00;€ 7,904.54;€ 846.46;10.71%;formatted`
    );
    expect(result.errors).toHaveLength(0);
    expect(result.rows[0].data.total).toBe(8751);
    expect(result.rows[0].data.capital).toBeCloseTo(7904.54);
    expect(result.rows[0].data.gain).toBeCloseTo(846.46);
    expect(result.rows[0].data.gainPct).toBeCloseTo(10.71);
  });

  it("parses the real-world sample input", () => {
    const csv = [
      "Date;Total;Capital w/o Gain;Gain;Gain in %;Comment",
      "06.04.2024;€ 8,751.00;€ 7,904.54;€ 846.46;10.71%;",
      "13.04.2024;€ 8,827.75;€ 7,919.79;€ 907.96;11.46%;",
      "20.04.2024;€ 8,377.88;€ 7,919.79;€ 458.09;5.78%;",
      "04.08.2024;€ 9,309.14;€ 9,309.14;-€ 286.91;-5.27%;",
    ].join("\n");
    const result = parseCsv(csv);
    expect(result.errors).toHaveLength(0);
    expect(result.rows).toHaveLength(4);
    expect(result.rows[0].data.date).toBe("2024-04-06");
    expect(result.rows[0].data.total).toBe(8751);
    expect(result.rows[3].data.gain).toBeCloseTo(-286.91);
    expect(result.rows[3].data.gainPct).toBeCloseTo(-5.27);
  });
});
