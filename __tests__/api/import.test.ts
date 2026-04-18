// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import * as XLSX from "xlsx";

vi.mock("@/lib/db", () => ({
  prisma: {
    entry: {
      upsert: vi.fn(),
    },
  },
}));

import { POST as importPost } from "@/app/api/import/route";
import { prisma } from "@/lib/db";
import { NextRequest } from "next/server";

const mockPrisma = prisma as unknown as {
  entry: { upsert: ReturnType<typeof vi.fn> };
};

function makeXlsx(rows: unknown[][]): Uint8Array {
  const ws = XLSX.utils.aoa_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Uint8Array;
  return buf;
}

function makeMultipartRequest(filename: string, buffer: Uint8Array): NextRequest {
  const formData = new FormData();
  // Copy into a plain ArrayBuffer to satisfy TypeScript's strict BlobPart typing
  const ab = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;
  formData.append(
    "file",
    new File([ab], filename, {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    })
  );
  return new NextRequest("http://localhost:3000/api/import", {
    method: "POST",
    body: formData,
  });
}

const HEADERS = ["Date", "Total", "Capital w/o Gain", "Gain", "Gain in %", "Comment"];

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/import", () => {
  it("imports valid rows and returns summary", async () => {
    mockPrisma.entry.upsert.mockResolvedValue({});
    const buf = makeXlsx([
      HEADERS,
      ["2024-01-07", 10000, 8000, 2000, 25, "Week 1"],
      ["2024-01-14", 10500, 8000, 2500, 31.25, "Week 2"],
    ]);
    const req = makeMultipartRequest("portfolio.xlsx", buf);
    const res = await importPost(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.imported).toBe(2);
    expect(body.skipped).toBe(0);
    expect(body.errors).toHaveLength(0);
  });

  it("rejects non-xlsx files", async () => {
    const formData = new FormData();
    formData.append("file", new File(["not excel"], "data.txt", { type: "text/plain" }));
    const req = new NextRequest("http://localhost:3000/api/import", {
      method: "POST",
      body: formData,
    });
    const res = await importPost(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/xlsx/i);
  });

  it("returns 400 when no file is uploaded", async () => {
    const formData = new FormData();
    const req = new NextRequest("http://localhost:3000/api/import", {
      method: "POST",
      body: formData,
    });
    const res = await importPost(req);
    expect(res.status).toBe(400);
  });

  it("reports parse errors for invalid rows without failing the whole import", async () => {
    mockPrisma.entry.upsert.mockResolvedValue({});
    const buf = makeXlsx([
      HEADERS,
      ["2024-01-07", 10000, 8000, 2000, 25, "valid"],
      ["bad-date", 10000, 8000, 2000, 25, "invalid date"],
    ]);
    const req = makeMultipartRequest("portfolio.xlsx", buf);
    const res = await importPost(req);
    const body = await res.json();
    expect(body.imported).toBe(1);
    expect(body.errors).toHaveLength(1);
  });

  it("upserts (updates) rows with existing dates", async () => {
    mockPrisma.entry.upsert.mockResolvedValue({});
    const buf = makeXlsx([
      HEADERS,
      ["2024-01-07", 10000, 8000, 2000, 25, "re-import"],
    ]);
    const req = makeMultipartRequest("portfolio.xlsx", buf);
    await importPost(req);
    expect(mockPrisma.entry.upsert).toHaveBeenCalledTimes(1);
    expect(mockPrisma.entry.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ date: expect.any(Date) }),
        update: expect.any(Object),
        create: expect.any(Object),
      })
    );
  });
});
