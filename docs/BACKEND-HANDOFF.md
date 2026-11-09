# Aethra 2.0 — Backend handoff

Updated 9 November 2026. Baseline commit: `947e613` on `develop/v2`.
This document describes the implemented state, not a proposal. Code is the source of truth; update this file when contracts change.

## 1. Status

- Next.js 16 App Router, React 19, JavaScript/JSX, Tailwind 4 + custom CSS.
- PostgreSQL through Drizzle ORM (`drizzle-orm/node-postgres`, `pg`).
- Accounts, sessions, preferences, conversations, messages, and rate limits are server-persisted.
- Assistant replies are scripted (`src/server/demoReply.js`), clearly labeled as demo responses. No AI provider, no streaming, no keys.
- Approved UI preserved: cinematic dark-first theme, system light theme, responsive layouts, reduced-motion support.
- `main` is untouched. Work only on `develop/v2`; no merge/deploy/force-push without explicit instruction.

## 2. Setup and commands

1. `npm install`
2. `.env.local` must contain `DATABASE_URL` pointing at the PostgreSQL instance and `aethra_db`. Never commit or print it.
3. `npm run db:migrate`
4. `npm run dev`

| Command                                                | Purpose                                      |
| ------------------------------------------------------ | -------------------------------------------- |
| `npm run dev`                                          | Development server                           |
| `npm run build` / `npm start`                          | Production build/server                      |
| `npm run db:migrate`                                   | Apply pending migrations                     |
| `npx drizzle-kit generate --config=drizzle.config.mjs` | Generate migration after schema edits        |
| `npm run lint`                                         | ESLint                                       |
| `npm test`                                             | Local unit tests, no database                |
| `npm run test:integration`                             | PostgreSQL/API tests; server must be running |
| `npm run format:check` / `npm run format`              | Prettier                                     |

Migrations are applied to schema `public`. `drizzle.__drizzle_migrations` is only migration history. If pgAdmin shows no tables, expand `public`.

## 3. Architecture

```
Browser (React pages/components)
  -> src/lib/api.js (same-origin fetch, credentials)
  -> src/app/api/**/route.js (validation, auth, rate limit, ownership)
  -> src/server/* (Drizzle queries, sessions, demo reply)
  -> PostgreSQL
```

- `src/proxy.js` redirects unauthenticated page requests to `/auth` based only on cookie presence. This is UX protection; every API enforces real authorization.
- Server modules start with `import "server-only"`.
- `src/lib/localConversations.js` handles only legacy browser data for opt-in backup/import. It is not the live data source.

## 4. Database schema

All application tables are in `public`.

| Table           | Key columns                                                                                 | Relationships/constraints                                                                    |
| --------------- | ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `users`         | `id` uuid PK, names, `email` unique, `password_hash`, `status`, timestamps                  | Status `active`/`disabled`; email max 254                                                    |
| `sessions`      | `id` uuid PK, `user_id` FK, `token_hash` unique, `expires_at`, `last_used_at`, `revoked_at` | FK -> `users` cascade; indexes on user and expiry                                            |
| `preferences`   | `user_id` PK/FK, `model`, `temperature`, `response_length`                                  | FK -> `users` cascade; model/creativity/length CHECKs                                        |
| `conversations` | `id` uuid PK, `user_id` FK, `title`, `legacy_id`, `model`, timestamps                       | FK -> `users` cascade; unique `(user_id, legacy_id)`; user/updated index; title/model CHECKs |
| `messages`      | `id` uuid PK, `conversation_id` FK, `role`, `position`, `content`, `created_at`             | FK -> `conversations` cascade; unique `(conversation_id, position)`; role/content CHECKs     |
| `rate_limits`   | `key` varchar PK, `hits`, `reset_at`                                                        | Standalone; index on `reset_at`                                                              |

Allowed values:

- `status`: `active`, `disabled`
- `model`: `Aethra 1.0`, `Aethra 1.1`
- `temperature`: 0–2
- `response_length`: `Short`, `Balanced`, `Detailed`
- `role`: `user`, `ai`
- Conversation title: 1–300 characters after trim
- Message content: 1–10000 characters

Ownership rule: `conversations.user_id` and the parent conversation authorize every message operation. Foreign or unknown IDs return 404.

## 5. HTTP conventions

- Mutating requests must pass `validOrigin(req)`: same-origin `Origin`, and `Sec-Fetch-Site` must not be `cross-site`.
- JSON body size limits: 64 KB default, 1 MB for browser import. Unknown fields are ignored.
- Success: `200`/`201` with `{ user }`, `{ preferences }`, `{ conversation }`, `{ conversations, hasMore }`, `{ ok: true }`, or `{ imported, skipped }`.
- Errors: `{ error: string }` with `400` validation, `401` unauthenticated, `403` origin/current password/role injection, `404` not found or foreign-owned, `409` duplicate/conflict, `429` rate limit, `503` generic failure.
- JSON responses use `Cache-Control: no-store`. Raw SQL/provider errors are never returned.

## 6. API contracts

| Method | Route                             | Auth   | Contract                                                                                                                                       |
| ------ | --------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| POST   | `/api/auth/register`              | no     | `{ firstName, lastName, email, password }`; password 12–128; creates user, preferences, session; 201                                           |
| POST   | `/api/auth/login`                 | no     | `{ email, password }`; updates `lastLoginAt`; creates session                                                                                  |
| POST   | `/api/auth/logout`                | cookie | Revokes token, clears cookie, `{ ok: true }`                                                                                                   |
| GET    | `/api/auth/session`               | cookie | `{ user }` or 401                                                                                                                              |
| PATCH  | `/api/profile`                    | cookie | `{ firstName, lastName, email, currentPassword?, password? }`; sensitive changes require current password, rate-limited, revoke other sessions |
| GET    | `/api/preferences`                | cookie | `{ preferences }`, defaults if missing                                                                                                         |
| PUT    | `/api/preferences`                | cookie | Upserts validated `{ model, temperature, responseLength }`                                                                                     |
| GET    | `/api/conversations`              | cookie | `?q=&offset=`; owner-scoped title/message search, pagination 100 + `hasMore`, escaped wildcards                                                |
| POST   | `/api/conversations`              | cookie | `{ prompt, model }`; creates conversation + first user message atomically; 201                                                                 |
| POST   | `/api/conversations/import`       | cookie | `{ conversations: [...] }`; max 25, max 500 messages each; idempotent by `legacyId`                                                            |
| GET    | `/api/conversations/:id`          | cookie | Owner-scoped full conversation                                                                                                                 |
| PATCH  | `/api/conversations/:id`          | cookie | `{ title }` 1–300                                                                                                                              |
| DELETE | `/api/conversations/:id`          | cookie | Owner-scoped delete                                                                                                                            |
| POST   | `/api/conversations/:id/messages` | cookie | `{ text, role: "user", model? }`; rejects client `role: "ai"`; appends with advisory lock                                                      |
| POST   | `/api/conversations/:id/reply`    | cookie | Appends scripted reply only when the last message is from the user; 409 otherwise                                                              |

Public user shape excludes `passwordHash` and session data: `id`, names, email, status, `createdAt`, `updatedAt`, `lastLoginAt`, `lastActivityAt`.

## 7. Authentication and security

- Argon2id password hashing (`argon2` package). Login performs a dummy verify for unknown emails to reduce timing/account enumeration.
- Session tokens: 32 random bytes, base64url; only SHA-256 hash stored. Cookie `aethra_session` is HttpOnly, `SameSite=Lax`, `Path=/`, `Secure` in production, 14-day expiry.
- `currentUser()` joins sessions to active users and checks expiry/revocation; updates activity timestamps at most every 5/15 minutes.
- Password or email change requires the current password, is rate-limited, and revokes every other session.
- Rate limits persisted in `rate_limits`, 15-minute windows: login per email/IP, register per email/IP, create/message/reply/import/profile per user.
- Login/register opportunistically delete expired sessions and stale rate limits.
- Security headers in `next.config.mjs`: nosniff, DENY framing, referrer policy, permissions policy, same-origin opener, HSTS; `poweredByHeader: false`.

## 8. Migration history

- `0000`–`0002`: initial schema, account/conversation APIs.
- `0003_cool_tiger_shark.sql`: additive constraints and indexes (status, model, temperature, response length, title, role, content, unique message position, expiry/reset indexes).
- Never edit an applied migration. Generate a new one for schema changes.
- Existing data was verified clean before `0003`; original rows were preserved.

## 9. Frontend integration

| Area          | Files                            | Behavior                                                                        |
| ------------- | -------------------------------- | ------------------------------------------------------------------------------- |
| Auth          | `src/app/auth/page.jsx`          | Login/register; redirects already-authenticated users                           |
| Home          | `src/app/page.jsx`               | Creates server conversation, sends selected model, duplicate-send protection    |
| Chat          | `src/app/chat/[id]/page.jsx`     | Loads history, sends message, scripted reply, retry, copy/export, clear errors  |
| Conversations | `src/app/projects/page.jsx`      | Server list, search, pagination, rename, delete, explicit legacy import, backup |
| Search        | `src/components/SearchModal.jsx` | Debounced server search with loading/empty/error states                         |
| Settings      | `src/app/settings/page.jsx`      | Profile/password, account dates, model/creativity/length, loading/saving states |
| Navigation    | `src/components/Sidebar.jsx`     | Recent conversations, account menu, logout only when authenticated              |

UI copy must keep saying responses are scripted/demo, not AI-generated.

## 10. Verification performed

At commit `947e613` the following were actually run and passed:

- `npm run db:migrate` (including idempotent re-run)
- `npm run lint`
- `npm test` — 3 passing local tests
- `npm run format:check`
- `npm run build`
- `npm run test:integration` against `npm run dev` and `npm start`
- Browser end-to-end: register, create conversation, reply, settings save, preferences save, projects, search, rename, refresh persistence, logout, protected-route redirect

The integration suite creates disposable accounts, verifies ownership isolation, CSRF/origin rejection, cookie flags, metadata, validation, cross-account access, role injection, duplicate reply, search escaping, and cleans up its users. The original database counts were restored after testing.

## 11. Known gaps and next steps

- No AI provider, streaming, Stop propagation, or partial-response persistence. Demo replies are intentional.
- No email verification, password reset, account deletion, or MFA.
- No distributed rate limiting or background cleanup job; cleanup is opportunistic.
- Legacy browser import is manual and does not delete local data.
- Consider adding a scheduled cleanup job, structured logging/monitoring, and backup/restore runbook before production.
- Any new schema change: edit `src/server/schema.js`, generate `0004`, review SQL, test on disposable data, then migrate.
