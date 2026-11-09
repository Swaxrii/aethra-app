# Tests

| File                      | Command                    | Needs server/DB | What it covers                                                                                           |
| ------------------------- | -------------------------- | --------------- | -------------------------------------------------------------------------------------------------------- |
| `local-data.test.mjs`     | `npm test`                 | no              | Legacy browser backup is non-destructive, corrupt data is never overwritten, HTML export escapes content |
| `backend.integration.mjs` | `npm run test:integration` | yes             | PostgreSQL + API contracts, auth, sessions, ownership, validation, CSRF, search, import, cleanup         |

## Integration setup

1. Ensure `.env.local` has `DATABASE_URL` (never print it).
2. Apply migrations: `npm run db:migrate`.
3. Start the app: `npm run dev` or `npm run build && npm start`.
4. In another terminal: `npm run test:integration`.

Optional: `AETHRA_TEST_BASE_URL` overrides `http://localhost:3000`.

## Safety rules

- The integration suite creates users with random `@example.invalid` addresses and deletes them at the end.
- Never point the suite at real user accounts or a production database.
- `npm test` must stay database-free.
- Do not claim tests passed unless they were run in the current session.

## Coverage highlights

- Register/login/session/logout; public user omits `passwordHash`.
- Cookie attributes: `HttpOnly`, `SameSite=Lax`, `Path=/`.
- Origin/CSRF rejection on mutations.
- Cross-account conversation and preference isolation.
- Invalid UUID, validation errors, role injection, duplicate reply.
- Search by title/message, wildcard escaping.
- Legacy import idempotency and message ordering.
- Profile sensitive-change session revocation.

## Manual browser checks

For UI changes verify: register, login, protected redirect, send, reply, retry, rename, delete, search, settings/preferences save, refresh persistence, logout, mobile drawer, keyboard focus, and both themes.
