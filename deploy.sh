#!/usr/bin/env bash
# Usage: ./deploy.sh [user@host] [remote-path]
set -euo pipefail

HOST=${1:-"user@yourserver"}
REMOTE_DIR=${2:-"/opt/fintrckr"}

echo "Deploying to $HOST:$REMOTE_DIR …"
ssh "$HOST" bash -s <<EOF
  set -euo pipefail
  cd "$REMOTE_DIR"
  git pull --ff-only
  docker compose up --build -d
  docker image prune -f
EOF
echo "Done. App is running on $HOST:3000"
