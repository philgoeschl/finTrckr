import { describe, it, expect } from "vitest";
import { entryInputSchema } from "@/lib/validations";

const validEntry = {
  date: "2024-01-07",
  total: 10000,
  capital: 8000,
  gain: 2000,
  gainPct: 25,
  freeCash: 500,
  comment: "First entry",
};

describe("entryInputSchema", () => {
  it("accepts a valid entry", () => {
    const result = entryInputSchema.safeParse(validEntry);
    expect(result.success).toBe(true);
  });

  it("accepts negative gain (loss scenario)", () => {
    const result = entryInputSchema.safeParse({ ...validEntry, gain: -500, gainPct: -5 });
    expect(result.success).toBe(true);
  });

  it("accepts entry without freeCash", () => {
    const { freeCash: _, ...noFreeCash } = validEntry;
    const result = entryInputSchema.safeParse(noFreeCash);
    expect(result.success).toBe(true);
  });

  it("accepts entry with null freeCash", () => {
    const result = entryInputSchema.safeParse({ ...validEntry, freeCash: null });
    expect(result.success).toBe(true);
  });

  it("accepts entry without comment", () => {
    const { comment: _, ...noComment } = validEntry;
    const result = entryInputSchema.safeParse(noComment);
    expect(result.success).toBe(true);
  });

  it("rejects missing date", () => {
    const { date: _, ...noDate } = validEntry;
    const result = entryInputSchema.safeParse(noDate);
    expect(result.success).toBe(false);
  });

  it("rejects invalid date format", () => {
    const result = entryInputSchema.safeParse({ ...validEntry, date: "07/01/2024" });
    expect(result.success).toBe(false);
  });

  it("accepts missing total (derived from capital + gain)", () => {
    const { total: _, ...noTotal } = validEntry;
    const result = entryInputSchema.safeParse(noTotal);
    expect(result.success).toBe(true);
  });

  it("coerces string numbers", () => {
    const result = entryInputSchema.safeParse({
      ...validEntry,
      total: "10000.50",
      gain: "-200",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.total).toBe(10000.5);
      expect(result.data.gain).toBe(-200);
    }
  });

  it("rejects non-numeric total", () => {
    const result = entryInputSchema.safeParse({ ...validEntry, total: "abc" });
    expect(result.success).toBe(false);
  });

  it("accepts very high gainPct without capping", () => {
    const result = entryInputSchema.safeParse({ ...validEntry, gainPct: 500 });
    expect(result.success).toBe(true);
  });

  describe("required field enforcement", () => {
    it("rejects blank capital (empty string)", () => {
      const result = entryInputSchema.safeParse({ ...validEntry, capital: "" });
      expect(result.success).toBe(false);
    });

    it("rejects missing capital", () => {
      const { capital: _, ...noCapital } = validEntry;
      const result = entryInputSchema.safeParse(noCapital);
      expect(result.success).toBe(false);
    });

    it("rejects blank gain (empty string)", () => {
      const result = entryInputSchema.safeParse({ ...validEntry, gain: "" });
      expect(result.success).toBe(false);
    });

    it("rejects blank gainPct (empty string)", () => {
      const result = entryInputSchema.safeParse({ ...validEntry, gainPct: "" });
      expect(result.success).toBe(false);
    });

    it("accepts gain of 0 (break-even week)", () => {
      const result = entryInputSchema.safeParse({ ...validEntry, gain: 0, gainPct: 0 });
      expect(result.success).toBe(true);
    });

    it("accepts gainPct of 0", () => {
      const result = entryInputSchema.safeParse({ ...validEntry, gainPct: 0 });
      expect(result.success).toBe(true);
    });
  });

  describe("range constraints", () => {
    it("rejects capital of 0", () => {
      const result = entryInputSchema.safeParse({ ...validEntry, capital: 0 });
      expect(result.success).toBe(false);
    });

    it("rejects negative capital", () => {
      const result = entryInputSchema.safeParse({ ...validEntry, capital: -500 });
      expect(result.success).toBe(false);
    });

    it("rejects negative freeCash", () => {
      const result = entryInputSchema.safeParse({ ...validEntry, freeCash: -100 });
      expect(result.success).toBe(false);
    });

    it("accepts freeCash of 0", () => {
      const result = entryInputSchema.safeParse({ ...validEntry, freeCash: 0 });
      expect(result.success).toBe(true);
    });

    it("accepts missing freeCash (optional)", () => {
      const { freeCash: _, ...noFreeCash } = validEntry;
      const result = entryInputSchema.safeParse(noFreeCash);
      expect(result.success).toBe(true);
    });
  });
});
