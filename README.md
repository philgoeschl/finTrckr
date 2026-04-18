# finTrckr

Personal weekly portfolio tracker. Record your stock/ETF portfolio value every Sunday, visualize gains over time, and export your data to CSV.

---

## Features

- **Dashboard** — KPI cards (portfolio value, gain, week-over-week delta, free cash) with a sparkline
- **Entries** — Interactive table with add, edit, and delete; sorted by date
- **Charts** — Portfolio value vs capital, gain in EUR, and gain % over time
- **XLSX import** — Bulk-import historical data from an Excel file
- **CSV export** — Download all data for use in Excel

---

## Development Setup

### Prerequisites

- Node.js 22+
- Docker + Docker Compose

### 1. Clone and install

```bash
git clone https://github.com/philgoeschl/finTrckr.git
cd finTrckr
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

For local development with the Compose database, set in `.env`:
```
DATABASE_URL=postgresql://fintrckr:devpassword@localhost:5432/fintrckr
```

### 3. Start the database

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up db -d
```

### 4. Run migrations

```bash
npx prisma migrate dev
```

To inspect data visually:
```bash
npx prisma studio
```

### 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Testing

```bash
npm test               # run all tests once
npm run test:watch     # watch mode
npm run test:coverage  # with coverage report
```

---

## Deployment (Docker Compose)

### 1. Copy env file and set password

```bash
cp .env.example .env
# Edit .env — set a strong POSTGRES_PASSWORD
```

### 2. Build and start

```bash
docker compose up -d --build
```

This will:
1. Build the Next.js app (multi-stage, minimal image)
2. Start PostgreSQL with a persistent named volume (`fintrckr_pgdata`)
3. Run `prisma migrate deploy` on first boot
4. Serve the app at `http://<server-ip>:3000`

### 3. Updates

```bash
docker compose up -d --build
```

Data is stored in the `fintrckr_pgdata` Docker volume and survives container restarts and rebuilds.

### Stop / Start

```bash
docker compose down        # stop (data kept)
docker compose down -v     # stop AND delete all data
docker compose up -d       # restart without rebuild
```

---

## Usage Guide

### Weekly check-in

1. Open the app on Sunday after reviewing your portfolio.
2. Go to **Entries** → **Add Entry**.
3. Fill in: Date, Total portfolio value, Capital w/o Gain (what you invested), Gain (EUR), Gain %, Free Cash (cash sitting on your brokerage account), and an optional comment.
4. Click **Add Entry**. The dashboard will immediately reflect the new values.

### Importing historical data

Prepare an Excel file (`.xlsx`) with these columns (header names are case-insensitive):

| Date | Total | Capital w/o Gain | Gain | Gain in % | Comment |
|------|-------|-----------------|------|-----------|---------|

- `Free Cash` column is optional.
- Dates can be in `YYYY-MM-DD`, `DD.MM.YYYY`, or Excel serial format.
- Re-importing a file is safe — rows with an existing date are updated, not duplicated.

Go to **Entries** → **Import XLSX**, select your file. A summary toast shows how many rows were imported and if any had errors.

### Editing or deleting an entry

In the **Entries** table, click the pencil icon to edit or the trash icon to delete. Deletions require confirmation.

### Exporting data

Go to **Entries** → **Export CSV**. A file named `fintrckr-export.csv` will download, compatible with Excel.

### Charts

Visit **Charts** to see:
- **Portfolio Value vs Capital** — area chart showing total portfolio value and invested capital over time (the gap is your gain)
- **Gain (EUR)** — how your absolute gain has changed
- **Gain (%)** — percentage gain over time

---

## Data Fields

| Field | Description |
|-------|-------------|
| Date | The Sunday of the weekly check-in |
| Total | Total portfolio value in EUR |
| Capital w/o Gain | The amount you have invested (without gain) |
| Gain | Gain in EUR (can be negative for losses) |
| Gain % | Gain as a percentage of capital |
| Free Cash | Cash available in the brokerage account (optional) |
| Comment | Any notes for that week |
