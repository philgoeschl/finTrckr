import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { entryInputSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const where: Record<string, unknown> = {};
  if (from || to) {
    where.date = {
      ...(from ? { gte: new Date(from) } : {}),
      ...(to ? { lte: new Date(to) } : {}),
    };
  }

  const entries = await prisma.entry.findMany({
    where,
    orderBy: { date: "desc" },
  });

  return NextResponse.json(entries);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = entryInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { date, gain, gainPct, freeCash, comment } = parsed.data;
  const capital = parsed.data.capital ?? 0;
  const total = parsed.data.total ?? capital + gain;

  try {
    const entry = await prisma.entry.create({
      data: {
        date: new Date(date),
        total,
        capital,
        gain,
        gainPct,
        freeCash: freeCash ?? null,
        comment: comment ?? null,
      },
    });
    return NextResponse.json(entry, { status: 201 });
  } catch (err: unknown) {
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      (err as { code: string }).code === "P2002"
    ) {
      return NextResponse.json(
        { error: "An entry for this date already exists." },
        { status: 409 }
      );
    }
    throw err;
  }
}
