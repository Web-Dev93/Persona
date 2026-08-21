#!/usr/bin/env bash
#
# Wgranie kodu na serwer, zbudowanie i restart usługi.
# Uruchom Z MASZYNY LOKALNEJ (musi mieć dostęp SSH do serwera):
#
#   ./deploy/deploy.sh root@217.160.189.8
#
# Wymaga na maszynie lokalnej: ssh, rsync.
# Serwer musi być wcześniej przygotowany skryptem deploy/bootstrap.sh.

set -euo pipefail

TARGET="${1:-}"
APP_DIR="${APP_DIR:-/opt/persona}"
APP_USER="${APP_USER:-persona}"

if [[ -z "$TARGET" ]]; then
  echo "Użycie: $0 user@host   (np. $0 root@217.160.189.8)" >&2
  exit 1
fi

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
log() { printf '\n\033[1;34m==>\033[0m %s\n' "$*"; }

log "Sprawdzanie połączenia z $TARGET"
ssh -o BatchMode=no -o ConnectTimeout=15 "$TARGET" "test -d $APP_DIR" || {
  echo "Katalog $APP_DIR nie istnieje na serwerze — uruchom najpierw deploy/bootstrap.sh." >&2
  exit 1
}

log "Wysyłanie plików do $TARGET:$APP_DIR"
rsync -az --delete \
  --exclude '.git/' \
  --exclude 'node_modules/' \
  --exclude 'dist/' \
  --exclude '.data/' \
  --exclude 'uploads/' \
  --exclude '.env' \
  --exclude '*.tsbuildinfo' \
  --exclude 'attached_assets/' \
  "$REPO_ROOT/" "$TARGET:$APP_DIR/"

log "Instalacja zależności i build na serwerze"
ssh "$TARGET" bash -s <<REMOTE
set -euo pipefail
cd "$APP_DIR"
export CI=true
npm install --include=dev --no-audit --no-fund
npm run build
mkdir -p uploads
chown -R $APP_USER:$APP_USER "$APP_DIR"
REMOTE

log "Restart usługi"
ssh "$TARGET" "systemctl restart persona && sleep 5 && systemctl is-active persona"

log "Kontrola po wdrożeniu"
ssh "$TARGET" "curl -sf http://127.0.0.1:3000/api/health && echo '' || (journalctl -u persona -n 40 --no-pager; exit 1)"

log "Wdrożenie zakończone"
echo "Aplikacja: http://\${TARGET#*@}/"
echo "Logi:      ssh $TARGET journalctl -u persona -f"
