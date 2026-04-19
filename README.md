# finTrckr

Personal weekly portfolio tracker. Record your stock/ETF portfolio value every Sunday, visualize gains over time, and export your data to CSV.

---

## Features

- **Dashboard** — KPI cards (portfolio value, gain, week-over-week delta, available cash) with a sparkline
- **Entries** — Interactive table with add, edit, and delete; sorted by date
- **Charts** — Portfolio value vs capital, gain in EUR, and gain % over time
- **CSV import** — Bulk-import historical data from a semicolon-delimited CSV file
- **CSV export** — Download all data for use in Excel

---

## Development Setup

### Prerequisites

- Node.js 22+
- Docker + Docker Compose (see [`install-docker.sh`](install-docker.sh) for a one-shot installer on Linux Mint / Ubuntu)

### Quick start

```bash
git clone https://github.com/philgoeschl/finTrckr.git
cd finTrckr
./dev-setup.sh
```

`dev-setup.sh` does everything in one shot:

1. Creates `.env` with dev defaults if it doesn't exist
2. Starts the Postgres container (port 5432)
3. Waits for the DB to be healthy
4. Installs `node_modules` if needed
5. Runs `prisma migrate dev`
6. Starts the Next.js dev server at [http://localhost:3000](http://localhost:3000)

### Manual steps (optional)

If you prefer to run steps individually:

```bash
cp .env.example .env
# Set DATABASE_URL=postgresql://fintrckr:devpassword@localhost:5432/fintrckr

docker compose -f docker-compose.yml -f docker-compose.dev.yml up db -d
npx prisma migrate dev
npm run dev
```

To inspect data visually:
```bash
npx prisma studio
```

---

## Testing

```bash
npm test               # run all tests once
npm run test:watch     # watch mode
npm run test:coverage  # with coverage report
npx tsc --noEmit       # type-check without building
```

A pre-push git hook runs `tsc --noEmit` automatically and blocks pushes on type errors. It lives at `.git/hooks/pre-push` — set it up on new clones with:

```bash
cp scripts/pre-push .git/hooks/pre-push
chmod +x .git/hooks/pre-push
```

---

## Deployment

### Server prerequisites (one-time)

```bash
# Install Docker + Compose plugin (Debian/Ubuntu)
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER   # re-login after this

# Clone the repo
git clone https://github.com/philgoeschl/finTrckr.git /opt/fintrckr
cd /opt/fintrckr

# Create .env with a strong production password
echo "POSTGRES_PASSWORD=$(openssl rand -base64 32 | tr -d /=+ | head -c 32)" > .env

# First deploy
docker compose up --build -d
```

This will:
1. Build the Next.js app (multi-stage, minimal image)
2. Start PostgreSQL with a persistent named volume (`fintrckr_pgdata`)
3. Run `prisma migrate deploy` on first boot
4. Serve the app at `http://<server-ip>:3000`

Data is stored in the `fintrckr_pgdata` Docker volume — it survives restarts and rebuilds.

### Deploying updates

From your local machine:

```bash
./deploy.sh user@yourserver
```

This SSHes into the server, pulls the latest commits, rebuilds the image, and restarts the stack. The script accepts the remote host as its first argument (defaults to `user@yourserver`) and an optional second argument for the remote path (defaults to `/opt/fintrckr`).

### Stop / Start / Wipe

```bash
# Run on the server, or prefix with: ssh user@server "cd /opt/fintrckr && ..."
docker compose down         # stop (data kept)
docker compose down -v      # stop AND delete all data
docker compose up -d        # restart without rebuild
```

---

## Usage Guide

### Weekly check-in

1. Open the app on Sunday after reviewing your portfolio.
2. Go to **Entries** → **Add Entry**.
3. Fill in the required fields (marked *): **Date**, **Capital** (current portfolio value including unrealised gain; can be negative for leveraged/borrowed positions), **Gain (EUR)**, **Gain %**. Optionally add **Available Cash** (uninvested cash; must be ≥ 0) and a comment. Total is derived automatically as Capital + Available Cash.
4. Click **Add Entry**. The dashboard will immediately reflect the new values.

### Importing historical data

Prepare a `.csv` file with `;` as the delimiter and these columns (header names are case-insensitive):

| Date | Total | Capital | Gain | Gain in % | Available Cash | Comment |
|------|-------|---------|------|-----------|----------------|---------|

- `Total`, `Available Cash`, and `Comment` columns are optional. If `Total` is omitted it is derived as `Capital + Available Cash`.
- The `Capital` column also accepts the headers `Invested Capital`, `Capital w/o Gain`, and `Invested Cash` (legacy broker export names).
- The `Available Cash` column also accepts the header `Free Cash` (legacy name).
- Dates can be in `YYYY-MM-DD` or `DD.MM.YYYY` format.
- Numeric values can include a currency prefix and thousands separator (e.g. `€ 8,751.00`, `-€ 286.91`, `10.71%`).
- Re-importing a file is safe — rows with an existing date are updated, not duplicated.

Go to **Entries** → **Import CSV**, select your file. A summary toast shows how many rows were imported and if any had errors.

#### Sample data

`sample-data.csv` in the project root contains 21 weekly entries (Jan–May 2024) with deposits, corrections, a withdrawal, and a sell-off — ready to import for a quick dev/demo setup:

```bash
# With the app running, import via the UI:
# Entries → Import CSV → select sample-data.csv
```

Example rows:
```
Date;Capital;Gain;Gain in %;Available Cash;Comment
07.01.2024;€ 6,150.75;€ 150.25;2.50%;€ 500.00;
21.01.2024;€ 5,910.20;-€ 90.30;-1.51%;;small correction
19.05.2024;€ 8,405.50;€ 905.50;12.07%;;withdrawal of € 500
```

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
| Total | Total assets in EUR — derived as Capital + Available Cash |
| Capital | Current portfolio value in EUR (includes unrealised gain); negative for leveraged/borrowed positions. Required. |
| Gain | Unrealised gain in EUR (already reflected in Capital; can be negative). Required. |
| Gain % | Gain as a percentage of capital. Required. |
| Available Cash | Uninvested cash in the brokerage account; must be ≥ 0 (optional) |
| Comment | Any notes for that week |
