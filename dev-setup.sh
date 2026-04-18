#!/usr/bin/env bash
set -euo pipefail

# ---------------------------------------------------------------------------
# finTrckr dev setup
# Starts the Postgres container, runs migrations, and launches the dev server.
# ---------------------------------------------------------------------------

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

# 1. Create .env from defaults if it doesn't exist
if [ ! -f .env ]; then
  echo "[setup] Creating .env with dev defaults..."
  cat > .env <<'EOF'
POSTGRES_PASSWORD=devpassword
DATABASE_URL=postgresql://fintrckr:devpassword@localhost:5432/fintrckr
EOF
  echo "[setup] .env created. Edit it if you need a different password."
else
  echo "[setup] .env already exists — skipping."
fi

# Load env so DATABASE_URL is available for prisma
set -a
# shellcheck disable=SC1091
source .env
set +a

# 2. Start only the DB container
echo "[setup] Starting Postgres..."
docker compose -f docker-compose.yml -f docker-compose.dev.yml up db -d

# 3. Wait until healthy
echo "[setup] Waiting for Postgres to be ready..."
until docker compose -f docker-compose.yml -f docker-compose.dev.yml exec -T db \
    pg_isready -U fintrckr -q 2>/dev/null; do
  printf "."
  sleep 1
done
echo " ready."

# 4. Install node_modules if needed
if [ ! -d node_modules ]; then
  echo "[setup] Installing dependencies..."
  npm install
fi

# 5. Apply / create migrations
echo "[setup] Running Prisma migrations..."
npx prisma migrate dev

# 6. Start the Next.js dev server
echo "[setup] Starting dev server at http://localhost:3000"
npm run dev
