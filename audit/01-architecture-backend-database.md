# Audit — architecture, backend, database

Updated 9 November 2026. Baseline `947e613`.

## Verdict

The architecture is coherent for the current product: Next.js App Router, server-only data modules, thin API routes, Drizzle/PostgreSQL, no unnecessary abstraction. The old local-demo backend has been replaced by server persistence without changing the approved UI.

## Architecture

```
React pages/components
  -> src/lib/api.js
  -> src/app/api/**/route.js
  -> src/server/auth.js | conversations.js | demoReply.js | http.js
  -> Drizzle ORM -> PostgreSQL
```

- API routes are thin: origin/CSRF check, body parsing, validation, auth, rate limit, ownership query, generic error.
- `src/server/*` is marked `server-only`; browser code never imports it.
- `src/proxy.js` only performs cookie-presence redirects for `/`, `/chat/*`, `/projects/*`, `/settings/*`. Authorization always happens again in APIs.
- `src/lib/localConversations.js` is legacy-only: backup and explicit browser import. It is not the live store.

## Backend contracts

| Route | Methods | Notes |
| --- | --- | --- |
| `/api/auth/register` | POST | User + preferences + session in one transaction |
| `/api/auth/login` | POST | Argon2id verify, session creation, login timestamps |
| `/api/auth/logout` | POST | Revoke + clear cookie |
| `/api/auth/session` | GET | Public user or 401 |
| `/api/profile` | PATCH | Name/email/password; current password for sensitive changes; revokes other sessions |
| `/api/preferences` | GET/PUT | Model, temperature, response length |
| `/api/conversations` | GET/POST | Search/pagination; atomic create + first user message |
| `/api/conversations/import` | POST | Explicit, idempotent legacy import |
| `/api/conversations/:id` | GET/PATCH/DELETE | Owner-scoped |
| `/api/conversations/:id/messages` | POST | User messages only; advisory-lock position allocation |
| `/api/conversations/:id/reply` | POST | Scripted reply only after a pending user message |

Conventions: `{ error }` bodies, 400/401/403/404/409/429/503, `Cache-Control: no-store`, no raw SQL/provider errors.

## Database

Tables in `public`: `users`, `sessions`, `preferences`, `conversations`, `messages`, `rate_limits`.

- `users` -> `sessions`, `preferences`, `conversations` (cascade).
- `conversations` -> `messages` (cascade).
- `messages` unique `(conversation_id, position)`; append serialized with `pg_advisory_xact_lock(hashtext(id))`.
- CHECK constraints: user status, conversation title/model, message role/content, preference model/temperature/response length.
- Indexes: user email, session token/user/expiry, conversation user+updated, legacy import uniqueness, rate-limit reset.
- `0003_cool_tiger_shark.sql` is additive and was applied after verifying existing data.
- `drizzle.__drizzle_migrations` is migration history only; application tables are under `public`.

## Strengths

- Ownership is expressed in SQL (`userId` filter), not trusted from the client.
- Message positions are protected by a unique index and a transaction-scoped lock.
- Legacy import is explicit, validated, idempotent, and does not delete local data.
- Search escapes `%`, `_`, and `\`.
- Pagination is bounded (100 + `hasMore`).

## Risks / recommendations

1. Add a scheduled cleanup job for expired sessions/rate limits instead of opportunistic cleanup.
2. Add structured logging, error monitoring, and a backup/restore runbook before production.
3. Decide retention and account-deletion policy.
4. If traffic grows, add a distributed rate limiter; current PostgreSQL limiter is single-app oriented.
5. Any schema change needs a new migration; never modify an applied one.
