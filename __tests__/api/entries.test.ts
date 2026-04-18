// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Mock Prisma before importing route handlers
vi.mock("@/lib/db", () => ({
  prisma: {
    entry: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

import { GET as getEntries, POST as postEntry } from "@/app/api/entries/route";
import { GET as getEntry, PUT as putEntry, DELETE as deleteEntry } from "@/app/api/entries/[id]/route";
import { prisma } from "@/lib/db";

const mockPrisma = prisma as unknown as {
  entry: {
    findMany: ReturnType<typeof vi.fn>;
    findUnique: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
};

function makeRequest(method: string, url: string, body?: unknown): NextRequest {
  if (body) {
    return new NextRequest(url, {
      method,
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });
  }
  return new NextRequest(url, { method });
}

const sampleEntry = {
  id: "cuid1",
  date: new Date("2024-01-07"),
  total: 10000,
  capital: 8000,
  gain: 2000,
  gainPct: 25,
  freeCash: 500,
  comment: "Week 1",
  createdAt: new Date(),
  updatedAt: new Date(),
  userId: null,
};

const validInput = {
  date: "2024-01-07",
  total: 10000,
  capital: 8000,
  gain: 2000,
  gainPct: 25,
  freeCash: 500,
  comment: "Week 1",
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/entries", () => {
  it("returns entries sorted by date desc", async () => {
    mockPrisma.entry.findMany.mockResolvedValue([sampleEntry]);
    const req = makeRequest("GET", "http://localhost:3000/api/entries");
    const res = await getEntries(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(1);
    expect(mockPrisma.entry.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { date: "desc" } })
    );
  });

  it("passes date filter when query params provided", async () => {
    mockPrisma.entry.findMany.mockResolvedValue([]);
    const req = makeRequest("GET", "http://localhost:3000/api/entries?from=2024-01-01&to=2024-12-31");
    await getEntries(req);
    expect(mockPrisma.entry.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ date: expect.any(Object) }),
      })
    );
  });
});

describe("POST /api/entries", () => {
  it("creates an entry and returns 201", async () => {
    mockPrisma.entry.create.mockResolvedValue(sampleEntry);
    const req = makeRequest("POST", "http://localhost:3000/api/entries", validInput);
    const res = await postEntry(req);
    expect(res.status).toBe(201);
  });

  it("returns 400 for invalid input", async () => {
    const req = makeRequest("POST", "http://localhost:3000/api/entries", { total: "abc" });
    const res = await postEntry(req);
    expect(res.status).toBe(400);
  });

  it("returns 409 on duplicate date (P2002)", async () => {
    mockPrisma.entry.create.mockRejectedValue({ code: "P2002" });
    const req = makeRequest("POST", "http://localhost:3000/api/entries", validInput);
    const res = await postEntry(req);
    expect(res.status).toBe(409);
  });
});

describe("GET /api/entries/[id]", () => {
  it("returns the entry when found", async () => {
    mockPrisma.entry.findUnique.mockResolvedValue(sampleEntry);
    const req = makeRequest("GET", "http://localhost:3000/api/entries/cuid1");
    const res = await getEntry(req, { params: Promise.resolve({ id: "cuid1" }) });
    expect(res.status).toBe(200);
  });

  it("returns 404 when not found", async () => {
    mockPrisma.entry.findUnique.mockResolvedValue(null);
    const req = makeRequest("GET", "http://localhost:3000/api/entries/nonexistent");
    const res = await getEntry(req, { params: Promise.resolve({ id: "nonexistent" }) });
    expect(res.status).toBe(404);
  });
});

describe("PUT /api/entries/[id]", () => {
  it("updates and returns the entry", async () => {
    mockPrisma.entry.update.mockResolvedValue(sampleEntry);
    const req = makeRequest("PUT", "http://localhost:3000/api/entries/cuid1", validInput);
    const res = await putEntry(req, { params: Promise.resolve({ id: "cuid1" }) });
    expect(res.status).toBe(200);
  });

  it("returns 404 when entry does not exist (P2025)", async () => {
    mockPrisma.entry.update.mockRejectedValue({ code: "P2025" });
    const req = makeRequest("PUT", "http://localhost:3000/api/entries/nope", validInput);
    const res = await putEntry(req, { params: Promise.resolve({ id: "nope" }) });
    expect(res.status).toBe(404);
  });

  it("returns 400 for invalid input", async () => {
    const req = makeRequest("PUT", "http://localhost:3000/api/entries/cuid1", { total: "x" });
    const res = await putEntry(req, { params: Promise.resolve({ id: "cuid1" }) });
    expect(res.status).toBe(400);
  });
});

describe("DELETE /api/entries/[id]", () => {
  it("deletes and returns 204", async () => {
    mockPrisma.entry.delete.mockResolvedValue(sampleEntry);
    const req = makeRequest("DELETE", "http://localhost:3000/api/entries/cuid1");
    const res = await deleteEntry(req, { params: Promise.resolve({ id: "cuid1" }) });
    expect(res.status).toBe(204);
  });

  it("returns 404 when entry does not exist (P2025)", async () => {
    mockPrisma.entry.delete.mockRejectedValue({ code: "P2025" });
    const req = makeRequest("DELETE", "http://localhost:3000/api/entries/nope");
    const res = await deleteEntry(req, { params: Promise.resolve({ id: "nope" }) });
    expect(res.status).toBe(404);
  });
});
