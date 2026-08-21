#!/usr/bin/env bash
#
# Jednorazowa konfiguracja serwera pod Persona Lead Catcher.
# Uruchom NA SERWERZE jako root:  bash bootstrap.sh
#
# Instaluje: Node.js 24, PostgreSQL, nginx, użytkownika systemowego,
# katalog aplikacji, bazę danych, usługę systemd i vhost nginx.
# Skrypt jest idempotentny — można go uruchomić ponownie.

set -euo pipefail

APP_NAME="persona"
APP_USER="persona"
APP_DIR="/opt/persona"
APP_PORT="${APP_PORT:-3000}"
DB_NAME="persona"
DB_USER="persona"
SERVER_NAME="${SERVER_NAME:-_}"

log() { printf '\n\033[1;34m==>\033[0m %s\n' "$*"; }

if [[ $EUID -ne 0 ]]; then
  echo "Ten skrypt musi być uruchomiony jako root." >&2
  exit 1
fi

log "Aktualizacja listy pakietów"
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq

log "Instalacja pakietów bazowych"
apt-get install -y -qq curl ca-certificates gnupg rsync

log "Instalacja Node.js 24"
if ! command -v node >/dev/null 2>&1 || [[ "$(node -v | cut -c2-3)" -lt 22 ]]; then
  curl -fsSL https://deb.nodesource.com/setup_24.x | bash -
  apt-get install -y -qq nodejs
fi
node -v

log "Instalacja PostgreSQL"
apt-get install -y -qq postgresql postgresql-contrib
systemctl enable --now postgresql

log "Instalacja nginx"
apt-get install -y -qq nginx
systemctl enable --now nginx

log "Użytkownik systemowy: $APP_USER"
if ! id -u "$APP_USER" >/dev/null 2>&1; then
  useradd --system --create-home --home-dir "/home/$APP_USER" --shell /usr/sbin/nologin "$APP_USER"
fi

log "Katalog aplikacji: $APP_DIR"
mkdir -p "$APP_DIR" "$APP_DIR/uploads"
chown -R "$APP_USER:$APP_USER" "$APP_DIR"

log "Baza danych: $DB_NAME"
if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" | grep -q 1; then
  DB_PASS="$(head -c 32 /dev/urandom | base64 | tr -d '/+=' | head -c 24)"
  sudo -u postgres psql -qc "CREATE ROLE $DB_USER LOGIN PASSWORD '$DB_PASS';"
  echo "$DB_PASS" > /root/.persona-db-password
  chmod 600 /root/.persona-db-password
  echo "Hasło do bazy zapisane w /root/.persona-db-password"
else
  if [[ -f /root/.persona-db-password ]]; then
    DB_PASS="$(cat /root/.persona-db-password)"
  else
    DB_PASS="$(head -c 32 /dev/urandom | base64 | tr -d '/+=' | head -c 24)"
    sudo -u postgres psql -qc "ALTER ROLE $DB_USER PASSWORD '$DB_PASS';"
    echo "$DB_PASS" > /root/.persona-db-password
    chmod 600 /root/.persona-db-password
    echo "Hasło do bazy zresetowane, zapisane w /root/.persona-db-password"
  fi
fi

if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" | grep -q 1; then
  sudo -u postgres createdb -O "$DB_USER" "$DB_NAME"
fi
sudo -u postgres psql -qc "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"

log "Plik środowiskowy: $APP_DIR/.env"
if [[ ! -f "$APP_DIR/.env" ]]; then
  cat > "$APP_DIR/.env" <<ENVFILE
NODE_ENV=production
PORT=$APP_PORT
BASE_PATH=/
DATABASE_URL=postgres://$DB_USER:$DB_PASS@127.0.0.1:5432/$DB_NAME

# Model czatu (OpenRouter) — UZUPEŁNIJ WŁASNYM KLUCZEM
OPENROUTER_API_KEY=
OPENROUTER_MODEL=deepseek/deepseek-chat

# Powiadomienia e-mail o leadach (opcjonalne)
LEAD_EMAIL=
COMPANY_NAME=Persona
RESEND_API_KEY=
LEAD_EMAIL_FROM=onboarding@resend.dev
ENVFILE
  chown "$APP_USER:$APP_USER" "$APP_DIR/.env"
  chmod 600 "$APP_DIR/.env"
  echo "Utworzono $APP_DIR/.env — uzupełnij OPENROUTER_API_KEY przed startem."
else
  echo "$APP_DIR/.env już istnieje — zostawiam bez zmian."
fi

log "Usługa systemd: $APP_NAME"
install -m 644 "$(dirname "$0")/persona.service" /etc/systemd/system/persona.service
systemctl daemon-reload
systemctl enable persona

log "Vhost nginx"
install -m 644 "$(dirname "$0")/nginx-persona.conf" /etc/nginx/sites-available/persona
if [[ "$SERVER_NAME" != "_" ]]; then
  sed -i "s/server_name _;/server_name $SERVER_NAME;/" /etc/nginx/sites-available/persona
fi
ln -sf /etc/nginx/sites-available/persona /etc/nginx/sites-enabled/persona
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

log "Gotowe"
cat <<SUMMARY

Serwer przygotowany. Następne kroki:

  1. Uzupełnij klucz API:   nano $APP_DIR/.env   (OPENROUTER_API_KEY=...)
  2. Wgraj kod i zbuduj:    z maszyny lokalnej uruchom deploy/deploy.sh
  3. Sprawdź status:        systemctl status persona
  4. Logi:                  journalctl -u persona -f

Port aplikacji ($APP_PORT) powinien być dostępny wyłącznie lokalnie —
ruch z internetu wchodzi przez nginx na porcie 80. Jeśli używasz ufw:

  ufw allow OpenSSH && ufw allow 'Nginx Full' && ufw deny $APP_PORT && ufw enable

SUMMARY
