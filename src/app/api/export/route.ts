import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { entriesToCsv } from "@/lib/csv-export";

export async function GET() {
  const entries = await prisma.entry.findMany({
    orderBy: { date: "asc" },
  });

  const csv = entriesToCsv(entries);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="fintrckr-export.csv"',
    },
  });
}
