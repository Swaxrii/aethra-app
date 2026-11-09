# Aethra 2.0

Aethra is a Next.js 16 workspace where accounts, sessions, preferences, conversations, and messages are stored in PostgreSQL. Assistant replies are intentionally scripted demonstrations (`src/server/demoReply.js`); no AI provider is connected.

- Stack: Next.js 16 App Router, React 19, JavaScript/JSX, Tailwind 4 + custom CSS, Drizzle ORM, PostgreSQL, Argon2id.
- Branch: `develop/v2`. Never modify `main`, force-push, merge, or deploy without explicit instruction.
- Current baseline commit: `947e613` — PostgreSQL backend and secure workspace integration.

## Quick start

1. `npm install`
2. Create `.env.local` with `DATABASE_URL=postgresql://<user>:<password>@192.168.0.3:5432/aethra_db`. Never commit or print this value.
3. `npm run db:migrate`
4. `npm run dev` and open `http://localhost:3000`

Tables are created by Drizzle migrations. Do not create them manually in pgAdmin. All application tables live in schema `public`; `drizzle.__drizzle_migrations` only stores migration history.

## Scripts

| Command                                                | Purpose                                                      |
| ------------------------------------------------------ | ------------------------------------------------------------ |
| `npm run dev`                                          | Development server                                           |
| `npm run build` / `npm start`                          | Production build and server                                  |
| `npm run db:migrate`                                   | Apply pending Drizzle migrations                             |
| `npx drizzle-kit generate --config=drizzle.config.mjs` | Generate a migration after editing `src/server/schema.js`    |
| `npm run lint`                                         | ESLint                                                       |
| `npm test`                                             | Fast local tests; no database required                       |
| `npm run test:integration`                             | PostgreSQL/API suite; requires a running server on port 3000 |
| `npm run format` / `npm run format:check`              | Prettier write/check                                         |

## Architecture

```
src/app/                 Pages and App Router API routes
src/app/api/             Auth, profile, preferences, conversations, import, reply
src/components/          Sidebar, search, markdown, select, visual primitives
src/lib/api.js           Browser fetch helper (same-origin credentials)
src/lib/localConversations.js  Legacy browser data, used only for opt-in import/backup
src/server/schema.js     Drizzle schema and constraints
src/server/auth.js       Sessions, current user, rate limits, cookie handling
src/server/conversations.js  Ownership-scoped read/list helpers
src/server/demoReply.js  Scripted assistant replies
src/server/http.js       JSON/body/origin/client-address helpers
src/proxy.js             Optimistic cookie check for protected pages
tests/                   Unit and PostgreSQL integration tests
drizzle/                 SQL migrations and metadata
```

Server components and API routes use `@/server/*`; those modules start with `import "server-only"`. Browser code uses `src/lib/api.js`.

## API map

| Method           | Route                             | Notes                                                                  |
| ---------------- | --------------------------------- | ---------------------------------------------------------------------- |
| POST             | `/api/auth/register`              | Creates user + preferences + session                                   |
| POST             | `/api/auth/login`                 | Argon2id verification, session rotation                                |
| POST             | `/api/auth/logout`                | Revokes current session and clears cookie                              |
| GET              | `/api/auth/session`               | Current public user or 401                                             |
| PATCH            | `/api/profile`                    | Name, email, password; current password required for sensitive changes |
| GET/PUT          | `/api/preferences`                | Model, temperature, response length                                    |
| GET/POST         | `/api/conversations`              | Owner-scoped list/search and creation                                  |
| POST             | `/api/conversations/import`       | Explicit import of legacy browser conversations                        |
| GET/PATCH/DELETE | `/api/conversations/:id`          | Owner-scoped read, rename, delete                                      |
| POST             | `/api/conversations/:id/messages` | Adds a user message only                                               |
| POST             | `/api/conversations/:id/reply`    | Adds a scripted assistant reply                                        |

All mutating routes require a same-origin `Origin` header. Responses use `Cache-Control: no-store` and generic error messages.

## Database

Schema: `users`, `sessions`, `preferences`, `conversations`, `messages`, `rate_limits`.

- `users` owns `sessions`, `preferences`, and `conversations` (cascade delete).
- `conversations` owns `messages` (cascade delete).
- `messages` has a unique `(conversation_id, position)` index; writes are serialized with a transaction-scoped advisory lock.
- CHECK constraints cover status, roles, title/content lengths, model labels, temperature, and response length.
- Migrations are additive; preserve existing rows. Never edit an applied migration.

## Security invariants

- Session cookie: HttpOnly, `SameSite=Lax`, `Secure` in production, 14-day expiry; token stored only as SHA-256 hash.
- Argon2id password hashing; unknown-email login performs a dummy verification.
- Rate limits are persisted in `rate_limits`, keyed by action plus hashed email/IP/user ID.
- Every conversation/message operation must filter by `userId`.
- Sensitive profile changes require the current password and revoke other sessions.
- Do not expose `passwordHash`, session tokens, database URLs, or raw provider/database errors.

## Legacy browser data

Old demo data may remain in `localStorage` under `aethra_projects`. It is never assigned automatically to a new account. The user can download a backup and explicitly import it from Conversations; the local copy is not deleted. Old demo passwords cannot be reused because the server uses Argon2id.

## Documentation

- `docs/BACKEND-HANDOFF.md` — detailed current backend/frontend handoff.
- `audit/README.md` — current audit summary and priorities.
- `docs/` and `audit/` are git-ignored local documentation; keep them accurate rather than treating them as committed truth.

## Known limitations

- Scripted replies, no streaming provider, no AI keys or provider integration.
- No email verification, password reset, or account deletion flow.
- `src/proxy.js` only checks cookie presence; real authorization is always server-side.
- Legacy import is manual and one-way (browser data is preserved).
- Rate limiting uses PostgreSQL and is suitable for the current single-app deployment, not a distributed edge setup.
