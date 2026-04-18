-- CreateTable
CREATE TABLE "entries" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "total" DECIMAL(12,2) NOT NULL,
    "capital" DECIMAL(12,2) NOT NULL,
    "gain" DECIMAL(12,2) NOT NULL,
    "gainPct" DECIMAL(8,4) NOT NULL,
    "freeCash" DECIMAL(12,2),
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,

    CONSTRAINT "entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "entries_date_idx" ON "entries"("date");

-- CreateIndex
CREATE INDEX "entries_userId_idx" ON "entries"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "entries_date_key" ON "entries"("date");
