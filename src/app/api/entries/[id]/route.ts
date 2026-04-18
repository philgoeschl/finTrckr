import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { entryInputSchema } from "@/lib/validations";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const entry = await prisma.entry.findUnique({ where: { id } });
  if (!entry) {
    return NextResponse.json({ error: "Entry not found." }, { status: 404 });
  }
  return NextResponse.json(entry);
}

export async function PUT(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await request.json();
  const parsed = entryInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { date, total, capital, gain, gainPct, freeCash, comment } = parsed.data;

  try {
    const entry = await prisma.entry.update({
      where: { id },
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
    return NextResponse.json(entry);
  } catch (err: unknown) {
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      (err as { code: string }).code === "P2025"
    ) {
      return NextResponse.json({ error: "Entry not found." }, { status: 404 });
    }
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

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    await prisma.entry.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (err: unknown) {
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      (err as { code: string }).code === "P2025"
    ) {
      return NextResponse.json({ error: "Entry not found." }, { status: 404 });
    }
    throw err;
  }
}
