#!/usr/bin/env bash
# Persona — pull, build and restart. Run as the persona user:
#
#   sudo -u persona /var/www/persona/deploy/deploy.sh
#
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/persona}"
BRANCH="${BRANCH:-main}"

cd "$APP_DIR"

echo "==> fetching $BRANCH"
git fetch --quiet origin "$BRANCH"
git checkout --quiet "$BRANCH"
git reset --hard --quiet "origin/$BRANCH"
echo "    now at $(git rev-parse --short HEAD) — $(git log -1 --pretty=%s)"

echo "==> installing dependencies"
npm ci --omit=dev --no-audit --no-fund 2>/dev/null || npm install --no-audit --no-fund

echo "==> building"
npm run build

echo "==> restarting service"
sudo systemctl restart persona

# Give it a moment, then confirm it actually came up rather than assuming.
for _ in $(seq 1 30); do
  if curl -fsS --max-time 2 "http://127.0.0.1:${PORT:-3001}/api/healthz" >/dev/null 2>&1; then
    echo "==> healthy: $(curl -fsS http://127.0.0.1:${PORT:-3001}/api/healthz)"
    exit 0
  fi
  sleep 1
done

echo "!! the service did not answer /api/healthz within 30s" >&2
echo "   check: sudo journalctl -u persona -n 50 --no-pager" >&2
exit 1
