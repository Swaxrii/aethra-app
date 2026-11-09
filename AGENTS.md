<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Aethra agent guide

Read this file first. Then read `README.md`; for backend work read `docs/BACKEND-HANDOFF.md`; for risks read `audit/README.md`. Do not read the whole repository before these four files.

## Project in one paragraph

Aethra 2.0 is a Next.js 16 App Router workspace with PostgreSQL persistence. Accounts, sessions, preferences, conversations, and messages are real server data. Assistant replies are scripted demos in `src/server/demoReply.js`; no AI provider exists. The approved UI is dark-first, cinematic, responsive, with a light system theme. Branch is `develop/v2`; `main` is off-limits. Do not force-push, merge, deploy, or rewrite history without explicit permission.

## Non-negotiable rules

- Work on `develop/v2`. Preserve uncommitted user changes; check `git status --short --branch` before editing.
- Keep `.env.local` and `DATABASE_URL` private. Never print, commit, or document the password.
- Use additive Drizzle migrations in `drizzle/`. Never edit or delete an applied migration. Apply with `npm run db:migrate`.
- Preserve existing database rows. Verify data before adding constraints that could fail on old rows.
- Keep JavaScript/JSX and the existing structure. Do not convert the project to TypeScript or replace Drizzle/PostgreSQL.
- Do not add an AI provider, streaming service, auth vendor, or ORM. Scripted replies are intentional.
- Every conversation/message/preferences operation must check the authenticated owner server-side. The proxy is only an optimistic UX redirect.
- Never weaken cookie, CSRF-origin, rate-limit, Argon2, validation, or generic-error behavior.
- Keep the approved visual design, animations, responsive behavior, and reduced-motion support.
- Do not claim tests/build passed unless they were actually run in this session.

## Commands

```bash
npm run dev
npm run db:migrate
npm run lint
npm test
npm run format:check
npm run build
npm run test:integration   # requires the app running on http://localhost:3000
```

After changing `src/server/schema.js`:

```bash
npx drizzle-kit generate --config=drizzle.config.mjs
npm run db:migrate
```

## Code map

- `src/app/api/**/route.js` — thin HTTP handlers: origin check, body/validation, `currentUser()`, ownership-scoped query, generic errors.
- `src/server/schema.js` — source of truth for tables, indexes, CHECK constraints.
- `src/server/auth.js` — `createSession`, `currentUser`, `revokeSession`, `revokeOtherSessions`, `limit`, `cleanupExpired`; cookie `aethra_session`.
- `src/server/http.js` — `json`, `error`, `body`, `validOrigin`, `clientAddress`, `safeFailure`.
- `src/server/conversations.js` — `readConversation` and `listConversations`, both scoped by `userId`.
- `src/lib/api.js` — browser fetch helper; same-origin credentials.
- `src/lib/localConversations.js` — legacy browser data, only for opt-in import/backup.
- `src/proxy.js` — cookie-presence redirect for `/`, `/chat/*`, `/projects/*`, `/settings/*`.
- `src/app/settings`, `src/app/projects`, `src/components/SearchModal.jsx`, `src/components/Sidebar.jsx` — main account/conversation UI.

## Data model essentials

`users` → `sessions`, `preferences`, `conversations`; `conversations` → `messages`; `rate_limits` is standalone. Delete cascades from users and conversations. `messages` has unique `(conversation_id, position)` and writes take `pg_advisory_xact_lock(hashtext(conversation_id))`. Model labels are only `Aethra 1.0` and `Aethra 1.1`. Response lengths are only `Short`, `Balanced`, `Detailed`.

## API patterns

- Mutations: `validOrigin(req)` first, then parse/validate, then auth, then rate limit where applicable.
- Success shape: `{ user }`, `{ preferences }`, `{ conversation }`, `{ conversations, hasMore }`, `{ ok: true }`, `{ imported, skipped }`.
- Errors: `{ error: "..." }` with 400/401/403/404/409/429/503; never leak stack traces or SQL.
- IDs are UUIDs validated before querying. Unknown or foreign-owned resources return 404.
- Assistant messages cannot be injected by clients; only the reply route creates `role: "ai"`.

## Testing rules

- `npm test` runs `tests/local-data.test.mjs` only; it must not touch PostgreSQL.
- `npm run test:integration` creates disposable users with random emails, checks ownership isolation, validation, CSRF rejection, cookie flags, search escaping, and cleanup. It deletes its users at the end.
- Start `npm run dev` or `npm start` before integration tests. Never point tests at real user data.
- For UI changes, verify login/register, chat send/reply/retry, rename, search, settings save, refresh persistence, logout, mobile layout, and protected-route redirect.

## Documentation rules

- `docs/` and `audit/` are git-ignored. Keep them current, but treat code as the source of truth.
- Update `docs/BACKEND-HANDOFF.md` and `audit/README.md` when architecture, schema, security, or test commands change.
- Keep docs concise and factual. Mark intentional demo behavior clearly; do not describe planned features as implemented.

## Known gaps

No email verification, password reset, account deletion, AI provider/streaming, or distributed rate limiting. Browser import is manual and local data is preserved. Session expiry is 14 days; cleanup runs opportunistically after login/register.
