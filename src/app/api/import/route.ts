import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parseCsv } from "@/lib/csv-parser";

export async function POST(request: NextRequest) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Failed to parse form data." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
  }

  const fileName = file instanceof File ? file.name : "";
  if (!fileName.match(/\.csv$/i)) {
    return NextResponse.json(
      { error: "Only .csv files are accepted." },
      { status: 400 }
    );
  }

  const arrayBuffer = await file.arrayBuffer();
  const text = new TextDecoder("utf-8").decode(arrayBuffer);

  let parseResult;
  try {
    parseResult = parseCsv(text);
  } catch {
    return NextResponse.json(
      { error: "Failed to parse the file. Ensure it is a valid CSV file." },
      { status: 400 }
    );
  }

  const { rows, errors } = parseResult;

  let imported = 0;
  let skipped = 0;
  const upsertErrors: { rowIndex: number; message: string }[] = [];

  for (const { rowIndex, data } of rows) {
    try {
      await prisma.entry.upsert({
        where: { date: new Date(data.date) },
        update: {
          total: data.total,
          capital: data.capital,
          gain: data.gain,
          gainPct: data.gainPct,
          freeCash: data.freeCash ?? null,
          comment: data.comment ?? null,
        },
        create: {
          date: new Date(data.date),
          total: data.total,
          capital: data.capital,
          gain: data.gain,
          gainPct: data.gainPct,
          freeCash: data.freeCash ?? null,
          comment: data.comment ?? null,
        },
      });
      imported++;
    } catch {
      skipped++;
      upsertErrors.push({ rowIndex, message: "Database error during upsert." });
    }
  }

  return NextResponse.json({
    imported,
    skipped,
    errors: [
      ...errors.map((e) => ({ rowIndex: e.rowIndex, message: e.message })),
      ...upsertErrors,
    ],
  });
}
