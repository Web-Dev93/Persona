# Persona — Generator Doradców AI & Lead Catcher

System do budowania, testowania i osadzania na dowolnej stronie doradców AI, którzy
prowadzą rozmowę z odwiedzającym, zbierają jego potrzeby i dane kontaktowe, a następnie
przekazują gotowego leada do właściciela (e-mail + webhook do CRM).

## Run & Operate

- `npm run dev` — API server (port 3001) + frontend Vite (port 3000) przez `scripts/dev.mjs`
- `npm run typecheck` — pełne sprawdzenie typów: biblioteki + serwer + frontend
- `npm run build` — typecheck bibliotek, build frontendu i serwera
- `npm test` — testy (jednostkowe + integracyjny potok leada na izolowanej bazie)
- `npm run check` — typecheck + testy, jedna komenda przed commitem
- `npm run codegen` — regeneracja klienta React Query i schematów Zod z `openapi.yaml`
- `npm start` — uruchomienie zbudowanego serwera (serwuje też frontend ze `dist/public`)

### Zmienne środowiskowe

| Zmienna | Rola |
| --- | --- |
| `DATABASE_URL` | Postgres. Bez niej system startuje na wbudowanym PGlite (`.data/pgdata`) |
| `OPENROUTER_API_KEY` | **Wymagana** — czat, podsumowania i analizy AI |
| `OPENROUTER_MODEL` | Model (domyślnie `deepseek/deepseek-chat`) |
| `RESEND_API_KEY` | Wysyłka e-maili z leadami; bez niej treść trafia tylko do logów |
| `LEAD_EMAIL_FROM` | Adres nadawcy (domyślnie `onboarding@resend.dev`) |
| `LEAD_EMAIL` / `COMPANY_NAME` | Wartości startowe dla ustawień w panelu admina |
| `PGLITE_DATA_DIR` | Katalog wbudowanej bazy (domyślnie `./.data`) |
| `UPLOAD_DIR` | Katalog przesłanych plików (domyślnie `./uploads`) |

## Ścieżki aplikacji

| Ścieżka | Opis |
| --- | --- |
| `/` | Landing z ofertą |
| `/simulator` | Studio: generator doradcy (5 kroków) + czat testowy |
| `/chat/:slug` | Publiczny czat z zapisanym doradcą; `?embed=1` ukrywa nawigację |
| `/demo/:hash` | Studio w trybie demo dla klienta |
| `/demo/:hash/crm` | Podgląd CRM z pozyskanymi leadami |
| `/admin` | Panel: analityka, leady, tryby, persony, style, integracje |
| `/widget.js` | Skrypt widgetu osadzanego na stronie klienta |

## Pełna ścieżka wdrożenia

1. **Studio** (`/simulator`) — wybór frameworka, suwaków psychologicznych, wiedzy,
   persony i stylu czatu; rozmowa testowa używa `customSystemPrompt`.
2. **Publikacja** (krok 5) — „Zapisz doradcę" tworzy personę w bazie i nadaje jej slug.
3. **Osadzenie** — wygenerowany snippet ustawia `window.LeadTrapConfig` i ładuje
   `/widget.js`, który montuje bąbel czatu z iframe `/chat/<slug>?embed=1`.
4. **Rozmowa** — dane kontaktowe (imię, e-mail, telefon, firma) są wyłapywane na bieżąco
   z każdej wiadomości użytkownika (regex) i zapisywane przy rozmowie.
5. **Zakończenie** (`POST /leads/:id/complete`) — podsumowanie AI, dogłębna analiza
   kontaktu i wymagań, a następnie wysyłka e-maila (Resend) oraz webhooka do CRM.
6. **CRM** (`/admin`, `/demo/:hash/crm`) — leady z kontaktem, podsumowaniem, wymaganiami,
   załącznikami, statusem dostarczenia i akcją „Wyślij ponownie".

## Stack

- Workspaces (bun/npm), Node.js 22+, TypeScript 5.9
- Frontend: React 19 + Vite + Tailwind 4 + wouter + TanStack Query
- API: Express 5, Pino, Multer
- AI: OpenRouter (OpenAI SDK)
- DB: PostgreSQL + Drizzle ORM, z automatycznym fallbackiem na PGlite
- Kontrakt API: OpenAPI → Orval (hooki React Query + schematy Zod)

## Gdzie co leży

- `lib/api-spec/openapi.yaml` — kontrakt API (źródło prawdy dla codegenu)
- `lib/db/src/schema/` — tabele: conversations, messages, attachments, personas,
  persona_types, app_settings
- `lib/db/src/index.ts` — wybór sterownika, `INIT_SQL` (idempotentne migracje), typ `Database`
- `lib/db/src/seed.ts` — startowe typy person i persony
- `artifacts/api-server/src/lib/lead-intelligence.ts` — wyciąganie kontaktu (regex + AI)
- `artifacts/api-server/src/lib/notifications.ts` — e-mail (Resend) i webhook
- `artifacts/api-server/src/lib/leads.ts` — wspólna logika podsumowań i payloadu leada
- `artifacts/api-server/src/routes/widget/` — konfiguracja i kod `widget.js`
- `artifacts/lead-catcher/src/lib/chat-styles.ts` — 10 stylów czatu + aliasy starych id
- `artifacts/lead-catcher/src/pages/` — landing, simulator, chat, admin, demo CRM

## Decyzje architektoniczne

- **Sesja**: `sessionToken` (UUID) w localStorage; wznowienie przez `/leads/session/:token`.
- **SSE**: odpowiedzi AI strumieniowane jako `text/event-stream`; frontend czyta je surowym
  `fetch` + `ReadableStream` (Orval nie generuje hooków dla SSE).
- **Kontakt**: regex działa przy każdej wiadomości (tani, deterministyczny); pełna analiza
  AI dopiero przy zakończeniu leada. Regex ma pierwszeństwo dla e-maila i telefonu, bo
  nie potrafi ich zmyślić.
- **Dostarczanie leada**: nigdy nie wywraca żądania odwiedzającego — błędy integracji
  trafiają do `errors[]` i logów, a flagi `emailSent` / `webhookSent` mówią prawdę o tym,
  co faktycznie wyszło.
- **Style czatu**: skonsolidowane do 10; stare identyfikatory (`dating`, `instagram`,
  `banking`, …) są mapowane przez `LEGACY_STYLE_ALIASES`, więc istniejące bazy działają.
- **Upload**: whitelist typów MIME, limit 10 MB, plik zapisywany w `uploads/` i wiązany
  z rozmową w tabeli `attachments`.

## Testy

`test/` uruchamiane wbudowanym runnerem Node (`node:test`) przez `tsx` — bez dodatkowych zależności.

- `lead-intelligence.test.ts` — wyciąganie kontaktu, w tym regresja: 9-cyfrowy wycinek
  z timestampu w URL-u nie jest numerem telefonu.
- `chat-styles.test.ts` — regresja zgłoszonego błędu (`generateEmbedScript` przyjmuje
  samo id stylu), parsowalność wygenerowanego snippetu i mapowanie starych id stylów.
- `lead-pipeline.test.ts` — startuje realny serwer na własnej bazie PGlite i lokalnym
  odbiorcy webhooka, po czym przechodzi całą ścieżkę: rozmowa → wykrycie kontaktu →
  załącznik → zakończenie → dostarczenie → wznowienie sesji → analityka.

Test integracyjny izoluje stan przez `PGLITE_DATA_DIR` i `UPLOAD_DIR`, więc nie dotyka
Twojej lokalnej bazy ani katalogu `uploads/`.

## Gotchas

- Po zmianie `openapi.yaml` uruchom `npm run codegen` (patchuje też import `zod/v4`).
- Ciała `multipart/form-data` są celowo nietypowane w specyfikacji — inaczej `File`/`Blob`
  trafiłyby do pakietu Zod, który kompiluje się bez DOM.
- `.data/` i `uploads/` to stan runtime — nie są wersjonowane, baza odtwarza się i seeduje
  przy starcie. Ich lokalizację zmienisz przez `PGLITE_DATA_DIR` i `UPLOAD_DIR`.
- Panel `/admin` i wszystkie `/api/admin/*` są **bez uwierzytelniania** — każdy, kto zna
  adres, zobaczy dane kontaktowe leadów. Do zamknięcia przed wystawieniem na publiczną
  domenę.
