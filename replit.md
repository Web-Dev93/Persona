# Lead Catcher

A lead-capture chatbot for a web agency. Clients land on the page and immediately begin a conversation with an AI consultant who gathers their website requirements, then sends a summary to the agency owner via email.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/lead-catcher run dev` — run the frontend (port 18838)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- Required env: `LEAD_EMAIL` — email address to receive lead summaries
- Optional env: `COMPANY_NAME` — company name shown in email (default: "Lead Catcher")
- Optional env: `RESEND_API_KEY` — Resend API key for sending emails
- Optional env: `LEAD_EMAIL_FROM` — sender address (default: "onboarding@resend.dev")

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite (artifact: `lead-catcher`, previewPath: `/`)
- API: Express 5 (artifact: `api-server`)
- AI: Anthropic Claude (via Replit AI Integrations — no user API key needed)
- DB: PostgreSQL + Drizzle ORM
- Email: Resend (via API key) — logs if not configured
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)

## Where things live

- `lib/api-spec/openapi.yaml` — API contract (source of truth)
- `lib/db/src/schema/conversations.ts` — conversation table (includes sessionToken, emailSent)
- `lib/db/src/schema/messages.ts` — messages table
- `artifacts/api-server/src/routes/anthropic/` — AI chat routes
- `artifacts/api-server/src/routes/leads/` — session resume + email send routes
- `artifacts/lead-catcher/src/` — React frontend (full-page chat UI)

## Architecture decisions

- Session persistence: `sessionToken` (UUID) stored in browser localStorage; backend looks it up on `/leads/session/:token`
- SSE streaming: AI responses stream via `text/event-stream`; frontend uses raw `fetch` + `ReadableStream` (Orval cannot generate hooks for SSE)
- Email: sent via Resend HTTP API when `RESEND_API_KEY` is set; logs to console otherwise
- Orval/Zod fix: generated `api.ts` is patched via `sed` to import from `zod/v4` instead of `zod` (catalog has v3)

## Product

Single-page lead capture tool: the entire page is a premium chat interface where clients describe their website needs to an AI consultant. After 5+ messages, a "Wyślij podsumowanie" button appears that emails the full conversation transcript to the agency owner.

## User preferences

_Populate as you build._

## Gotchas

- Always run codegen after changing `openapi.yaml`: `pnpm --filter @workspace/api-spec run codegen`
- The codegen script patches the Zod import automatically (see architecture decisions)
- Set `LEAD_EMAIL` env var before deploying or emails won't be sent
