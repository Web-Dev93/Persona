# Wdrożenie na własny serwer (VPS)

Aplikacja to jeden proces Node.js: serwer Express serwuje API pod `/api/*`
oraz zbudowany frontend React ze statycznych plików. Przed nim stoi nginx.

## Wymagania

- Serwer z Debianem/Ubuntu i dostępem root przez SSH
- Otwarte porty 80 (i 443, jeśli chcesz HTTPS)
- Klucz API OpenRouter (czat konsultanta)

## Krok 1 — przygotowanie serwera (jednorazowo)

Z maszyny lokalnej skopiuj katalog `deploy/` i uruchom bootstrap:

```bash
scp -r deploy root@TWOJ_SERWER:/root/persona-deploy
ssh root@TWOJ_SERWER 'bash /root/persona-deploy/bootstrap.sh'
```

Skrypt instaluje Node.js 24, PostgreSQL i nginx, zakłada użytkownika
systemowego `persona`, bazę `persona` z losowym hasłem (zapisanym w
`/root/.persona-db-password`), tworzy `/opt/persona/.env`, usługę systemd
oraz vhost nginx. Można go uruchamiać wielokrotnie — istniejącej
konfiguracji nie nadpisuje.

Jeśli masz domenę, wskaż ją od razu:

```bash
ssh root@TWOJ_SERWER 'SERVER_NAME=twojadomena.pl bash /root/persona-deploy/bootstrap.sh'
```

## Krok 2 — zmienne środowiskowe

```bash
ssh root@TWOJ_SERWER 'nano /opt/persona/.env'
```

Uzupełnij co najmniej `OPENROUTER_API_KEY`. `DATABASE_URL` jest już
ustawione na lokalnego Postgresa. Pełna lista zmiennych — patrz
`.env.example`.

> Bez `OPENROUTER_API_KEY` aplikacja wstanie i panel będzie działał, ale
> czat odpowie komunikatem o problemie z połączeniem.

## Krok 3 — wdrożenie kodu

Z katalogu repozytorium na maszynie lokalnej:

```bash
./deploy/deploy.sh root@TWOJ_SERWER
```

Skrypt wysyła kod przez rsync (bez `node_modules`, `dist`, `.data`,
`uploads` i `.env`), instaluje zależności, buduje frontend i serwer,
restartuje usługę i sprawdza `/api/health`. To samo polecenie służy do
każdej kolejnej aktualizacji.

## Krok 4 — HTTPS (zalecane)

```bash
ssh root@TWOJ_SERWER 'apt-get install -y certbot python3-certbot-nginx && certbot --nginx -d twojadomena.pl'
```

## Eksploatacja

| Czynność            | Polecenie                              |
| ------------------- | -------------------------------------- |
| Status              | `systemctl status persona`             |
| Logi na żywo        | `journalctl -u persona -f`             |
| Restart             | `systemctl restart persona`            |
| Kopia bazy          | `sudo -u postgres pg_dump persona > persona-$(date +%F).sql` |

Wgrywane zdjęcia person trafiają do `/opt/persona/uploads` — ten katalog
i baza danych to jedyny stan, który trzeba backupować.

## Zanim wystawisz to publicznie

1. **Panel administracyjny nie ma żadnej autoryzacji.** Trasy
   `/api/admin/*` i strona `/admin` są dostępne dla każdego, kto zna
   adres — razem z transkrypcjami rozmów i danymi kontaktowymi klientów.
   Doraźne zabezpieczenie: odkomentuj blok `auth_basic` w
   `deploy/nginx-persona.conf` i utwórz plik haseł (instrukcja w
   komentarzu). Docelowo autoryzacja powinna być w aplikacji.
2. **Port aplikacji tylko lokalnie.** Ruch z internetu ma wchodzić przez
   nginx. Jeśli używasz ufw:
   `ufw allow OpenSSH && ufw allow 'Nginx Full' && ufw deny 3000 && ufw enable`
3. **Klucz OpenRouter zaszyty w kodzie.** W
   `lib/integrations-anthropic-ai/src/client.ts` jest awaryjny klucz API
   wpisany na stałe i obecny w historii gita. Unieważnij go w panelu
   OpenRouter i korzystaj wyłącznie ze zmiennej `OPENROUTER_API_KEY`.

## Rozwiązywanie problemów

**Usługa nie startuje** — `journalctl -u persona -n 50`. Najczęstsza
przyczyna to brak lub literówka w `/opt/persona/.env`.

**Wszystkie zapytania do API zwracają 500** — brak połączenia z bazą.
Sprawdź `DATABASE_URL` i `systemctl status postgresql`. Aplikacja ma
awaryjny tryb z wbudowaną bazą PGlite w katalogu `.data/`, ale nie nadaje
się on na produkcję (dane giną przy przenoszeniu, brak backupu).

**Konsultant odpowiada dopiero po chwili całym blokiem tekstu** — nginx
buforuje strumień SSE. Upewnij się, że w vhoście jest sekcja
`location /api/anthropic/` z `proxy_buffering off`.
