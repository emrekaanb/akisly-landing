# Akışly — iş akışı otomasyonu landing page (kurgusal demo)

**Akışly** is a *fictional* service that automates repetitive back-office work (invoicing, appointments, stock, customer notifications) for small businesses. This repo is a small, complete product slice: a Turkish landing page that explains who the service helps and what problem it solves, plus a lead/request form that persists submissions on the server.

> Demo project only. All data is fictional test data. Not for commercial use.

## Stack

- Next.js 16 (App Router, Route Handlers) + TypeScript
- Tailwind CSS v4 + shadcn/ui (Base UI primitives)
- zod v4 (one schema shared by client and server), react-hook-form
- SQLite via `better-sqlite3` (file on disk)
- Vitest for API validation/persistence tests

## Run locally

Requires Node 20+ (tested on Node 22).

```bash
npm install
cp .env.example .env.local      # set ADMIN_TOKEN to enable the read-only records endpoint
npm run dev                     # http://localhost:4317 (dev)
# or production:
npm run build && npm run start  # http://localhost:4317
```

| Script | What it does |
| --- | --- |
| `npm run dev` / `npm run start` | Dev / production server on port **4317** (bound to `0.0.0.0`) |
| `npm test` | Vitest API tests (validation, persistence, restart, duplicates, admin endpoint) |
| `npm run lint` | ESLint |
| `npm run leads:list [n]` | Print the latest `n` (default 20) stored records from SQLite |

Environment variables:

| Variable | Default | Purpose |
| --- | --- | --- |
| `ADMIN_TOKEN` | unset | Token for `GET /api/leads`. When unset the endpoint returns 503 (disabled). |
| `LEADS_DB_PATH` | `./data/leads.db` | SQLite file location. |

## Architecture

```
src/
  app/
    page.tsx              Landing page (server component): hero → problem → audience →
                          services → how it works → form → FAQ → footer
    layout.tsx            Fonts (Inter latin-ext for Turkish), metadata, lang="tr"
    api/leads/route.ts    POST: validate + persist a lead. GET: token-protected read-only list
  components/
    lead-form.tsx         Client form (react-hook-form + zodResolver), all submit states
    ui/*                  shadcn/ui primitives
  lib/
    lead-schema.ts        Shared zod schema, service list, response types
    db.ts                 SQLite connection (singleton), schema creation, queries
scripts/list-leads.ts     CLI to inspect stored records
tests/leads-api.test.ts   Route handler tests against a temp SQLite file
```

Request flow: the form validates locally with the shared schema → `POST /api/leads` (JSON) → the route re-validates with the **same** schema → duplicate check → `INSERT … RETURNING` → `201 { ok: true, lead: { id, createdAt } }`. The UI shows the success state **only** on a `201` with `ok: true`; every other outcome renders an error.

## Validation

`src/lib/lead-schema.ts` is imported by both the client form and the API route:

| Field | Rules |
| --- | --- |
| `name` | trimmed, 2–80 chars |
| `email` | trimmed, valid email, ≤120 chars |
| `service` | one of `invoicing`, `appointments`, `inventory`, `customer-messaging`, `consulting` |
| `description` | trimmed, 20–1000 chars |

Server responses:

| Status | `error` | Meaning |
| --- | --- | --- |
| 201 | – | Persisted; body has the new record id |
| 400 | `invalid_json` | Body is not JSON |
| 422 | `validation` | `fieldErrors: { field: string[] }` (from `z.flattenError`); the form maps them onto the matching fields |
| 409 | `duplicate` | Same email + service + description in the last 10 minutes (prevents double submits) |
| 500 | `server` | Database failure; nothing claimed as saved |

Network failures and unexpected responses also show an error banner stating the request was not saved.

## Storage

- SQLite file at `data/leads.db` (git-ignored), created automatically with a `leads` table (`id`, `name`, `email`, `service`, `description`, `created_at` ISO-8601 UTC).
- WAL journal mode; the file survives server restarts (covered by a test that closes and reopens the connection, and verified manually by restarting the production server).
- `better-sqlite3` is a native module, so this needs a Node runtime with a writable disk (not serverless/edge).

## Verifying records

1. CLI (reads the SQLite file directly):

   ```bash
   npm run leads:list
   ```

2. Read-only HTTP endpoint (requires `ADMIN_TOKEN`):

   ```bash
   curl -H "Authorization: Bearer $ADMIN_TOKEN" http://localhost:4317/api/leads
   # or: http://localhost:4317/api/leads?token=$ADMIN_TOKEN&limit=20
   ```

3. Any SQLite client: `sqlite3 data/leads.db "select * from leads order by id desc;"`

## Tests

```bash
npm test
```

The tests call the route handlers directly with `Request` objects against a temporary SQLite file and cover: valid insert + row contents, trimming, per-field 422 errors with no write, missing fields, length limits, malformed JSON, duplicate detection (case-insensitive email), persistence across a connection close/reopen, a 500 when the DB can't be opened, and the token rules for `GET`.

## Notes

- See `AI_LOG.md` for how AI was used to build this.
- Copy on the site is Turkish; code and docs are English.
