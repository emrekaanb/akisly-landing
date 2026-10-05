# AI usage log

This project was built end to end by an AI coding agent (Cursor Cloud Agent, Claude) working from a single brief. No code was written by hand by a human. This log is an honest record of what was asked, what was decided, and what went wrong.

## Brief (summarised; original in Turkish)

Pick a fictional tech service, build a Turkish landing page explaining who it helps and what problem it solves, with a lead form (name, email, service, description) validated on client and server with a shared schema, persisted on the server so it survives restarts, plus a way to verify records. Next.js + TypeScript + Tailwind + shadcn/ui, tests for the API, README, this log, a public URL if possible, screenshots, and a draft PR.

## Decisions the AI made

| Decision | Why |
| --- | --- |
| Fictional service **Akışly**: workflow automation for 1–50 person businesses | Matches the example in the brief; easy to explain a clear problem (manual back-office work) and audience (shops, clinics, offices, cafés). |
| Page order: hero → problem → audience → services → 3 steps → form → FAQ | Classic problem/solution flow; the form comes after the visitor understands the offer. CTAs in header and hero jump to the form. |
| Service options in the form mirror the four service cards + "not sure" | Keeps the select meaningful and gives undecided visitors an option. |
| zod schema in `src/lib/lead-schema.ts` with Turkish messages | One source of truth; the client shows exactly the messages the server would return. |
| `better-sqlite3` file DB | Simplest durable storage with no extra service; synchronous API keeps the route handler simple. Next.js already treats it as a server-external package. |
| Server returns `fieldErrors` from `z.flattenError` with 422 | Lets the form map server errors onto the same fields via `setError`. |
| Server-only duplicate check (409 within 10 minutes) | Prevents accidental double submits and gives a real, server-originated error state to show in the UI. |
| Records verification: CLI script + token-protected read-only `GET /api/leads` | The brief asked for a script *or* protected endpoint; both are cheap. The endpoint is disabled (503) unless `ADMIN_TOKEN` is set, because the app is exposed via a public tunnel. |
| Inline success/error states, no toasts | The success message has to be tied to the server result; inline state is clearer and accessible (`role="status"` / `role="alert"`). Removed the scaffolded `sonner` component. |
| Port 4317, production build (`next start`) behind a Cloudflare quick tunnel | Uncommon port per brief; production mode is faster and more stable for a public link. |

## Main prompts / steps

1. Scaffold with `create-next-app` into `tmp-scaffold/`, move to repo root, `shadcn init`, add input/textarea/label/select/badge/accordion.
2. Write shared schema → DB module → route handler → tests; run tests before any UI work.
3. Build the form (react-hook-form + zodResolver) and landing sections.
4. Lint, typecheck, production build, start server, smoke test with `curl`.
5. Start `cloudflared tunnel --url` and confirm the public URL returns 200.
6. Playwright script (outside the repo) to: screenshot desktop/mobile full pages, trigger client validation, tamper a request after client validation to get real server 422 field errors in the UI, submit a valid fictional lead (201), resubmit for a 409, and check mobile horizontal overflow (0 px).
7. Restart the production server and confirm earlier records are still returned by `GET /api/leads` and `npm run leads:list`.

## Issues hit and fixes

| Issue | Fix |
| --- | --- |
| `npm i -D vitest` failed with ERESOLVE: Vite 8 wants `@types/node >=20.19 \|\| >=22.12`, scaffold pinned `^20`. | Bumped `@types/node` to `^22`. |
| This Next.js version (16.x) ships an `AGENTS.md` warning that APIs differ from training data. | Read the bundled Route Handler and `serverExternalPackages` docs before writing the API; no breaking change affected this code. |
| New shadcn uses Base UI and a `cn` npm package instead of `clsx`/`tailwind-merge`; `Button` uses `render` instead of `asChild`. | Used `render={<a href="#talep" />}` with `nativeButton={false}` for link buttons; Select takes `items` so the trigger shows labels, not raw values. |
| One test failed with "unable to open database file": invalid input never opens the DB, so the test's read-only check had no file. | Test helper treats a missing DB file as zero rows (which is exactly the "nothing written" assertion). |
| ESLint (React Compiler) warned that `watch()` from react-hook-form can't be memoised. | Switched to `useWatch`. |
| Turbopack warned that the dynamic DB path made file tracing include the whole project. | Added the documented `/*turbopackIgnore: true*/` hint on the env-driven path. |
| Screenshot review showed the service select shorter than the other inputs: shadcn's `data-[size=default]:h-8` beats a plain `h-11`. | Used `data-[size=default]:h-11`. |

## What was verified, and limits

- `npm test` (14 tests), `npm run lint`, `tsc --noEmit`, `npm run build` all pass.
- Real browser submission through the public tunnel created a record that is visible via the CLI and the endpoint, and survived a server restart.
- The Cloudflare quick tunnel URL is temporary: it changes whenever `cloudflared` restarts and has no uptime guarantee.
- The 422-from-server UI screenshot was produced by modifying the request in the browser after client validation passed (simulating a client that bypasses validation); the server response itself is real.
- No auth, rate limiting, or spam protection beyond the duplicate check; acceptable for a fictional demo, not for production.
