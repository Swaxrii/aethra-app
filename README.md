# Aethra

Aethra is a personal AI workspace built with Next.js 16 and PostgreSQL. It keeps accounts, sessions, preferences, conversations, and messages in a real database, with a dark cinematic interface that adapts to the system theme. Assistant replies stream from NVIDIA NIM.

## Features

- Account registration, sign-in, logout, and persistent 14-day sessions.
- Profile editing with password change and email update.
- Conversations saved to your account, with search, rename, delete, and history.
- Markdown assistant messages, copy, export to HTML, and retry.
- Model style, creativity, and response length preferences.
- Responsive sidebar, mobile drawer, keyboard-friendly controls, and reduced-motion support.
- Same-origin request checks, HttpOnly session cookies, Argon2id passwords, rate limiting, and per-user ownership checks.

## Tech stack

- Next.js 16 App Router, React 19, JavaScript/JSX
- Tailwind 4 with custom CSS
- PostgreSQL, Drizzle ORM, `pg`
- Argon2id password hashing
- `react-markdown` with GitHub-flavored Markdown

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env.local` with your PostgreSQL connection string:

   ```env
   DATABASE_URL=postgresql://<user>:<password>@<host>:5432/aethra_db
   NIVIDA_AI_API=<nvidia-api-key>
   ```

   Never commit this file or share the password.

3. Apply the database migrations:

   ```bash
   npm run db:migrate
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open `http://localhost:3000`.

Application tables are created by Drizzle migrations in schema `public`: `users`, `sessions`, `preferences`, `conversations`, `messages`, and `rate_limits`. The `drizzle` schema stores migration history only.

## Scripts

| Command                    | Description                                           |
| -------------------------- | ----------------------------------------------------- |
| `npm run dev`              | Start the development server                          |
| `npm run build`            | Create a production build                             |
| `npm start`                | Run the production server                             |
| `npm run db:migrate`       | Apply pending database migrations                     |
| `npm run lint`             | Run ESLint                                            |
| `npm test`                 | Run local tests                                       |
| `npm run test:integration` | Run the PostgreSQL/API suite (server must be running) |
| `npm run format`           | Format files with Prettier                            |
| `npm run format:check`     | Check formatting                                      |

After changing `src/server/schema.js`, generate a new migration before applying it:

```bash
npx drizzle-kit generate --config=drizzle.config.mjs
npm run db:migrate
```

## Project structure

```text
src/app/           Pages and API routes
src/components/    Shared interface components
src/lib/           Browser API helper and export formatting
src/server/        Database, authentication, and conversations
src/proxy.js       Protected-page redirect based on the session cookie
tests/             Local and integration tests
drizzle/           SQL migrations and metadata
```

## API overview

| Method           | Route                             | Purpose                                |
| ---------------- | --------------------------------- | -------------------------------------- |
| POST             | `/api/auth/register`              | Create an account and session          |
| POST             | `/api/auth/login`                 | Sign in                                |
| POST             | `/api/auth/logout`                | Sign out and revoke the session        |
| GET              | `/api/auth/session`               | Current user                           |
| PATCH            | `/api/profile`                    | Update profile or password             |
| GET/PUT          | `/api/preferences`                | Read or save assistant preferences     |
| GET/POST         | `/api/conversations`              | List, search, or create conversations  |
| GET/PATCH/DELETE | `/api/conversations/:id`          | Read, rename, or delete a conversation |
| POST             | `/api/conversations/:id/messages` | Add a user message                     |
| POST             | `/api/conversations/:id/reply`    | Stream and save an assistant reply     |

## Security notes

- Session tokens are stored as SHA-256 hashes; the cookie is HttpOnly, `SameSite=Lax`, and `Secure` in production.
- Passwords use Argon2id and never leave the server.
- Every conversation and message query is scoped to the signed-in user.
- Mutating requests require a same-origin `Origin` header.
- Rate limits are stored in PostgreSQL.
- Database credentials must stay only in `.env.local`.

## Demo behavior

The assistant streams replies from NVIDIA NIM. The API key stays on the server in `NIVIDA_AI_API`.

## Tests

Local tests:

```bash
npm test
```

Integration tests require a running app and database:

```bash
npm run db:migrate
npm run dev
# in another terminal
npm run test:integration
```

The integration suite creates disposable accounts, verifies authentication, ownership isolation, validation, and cleanup, and deletes its test users when finished.

## Status

Working: authentication, profiles, preferences, conversations, messages, search, and NVIDIA replies. Not included: email verification, password reset, and account deletion.
