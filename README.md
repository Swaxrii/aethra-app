# Aethra

Aethra stores accounts, sessions, preferences, and conversations in PostgreSQL. Assistant responses remain scripted demonstrations; no AI provider is connected.

## Local setup

1. Install dependencies with `npm install`.
2. Create a private `.env.local` containing `DATABASE_URL=postgresql://aethra:<password>@192.168.0.3:5432/aethra_db` with the actual password. `.env.local` is ignored by Git.
3. Run `npm run db:migrate` to apply additive Drizzle migrations, then `npm run dev` and open `http://localhost:3000`.

Existing browser conversations remain local. After creating a new account, open Conversations to download a backup and explicitly import those conversations. The browser data is never deleted by import and may contain conversations from multiple old demo accounts. Old demo passwords cannot be used for the new server account.

Run `npm run lint`, `npm test`, `npm run format:check`, and `npm run build` for code checks. These local tests do not use the PostgreSQL server or change existing user data.
