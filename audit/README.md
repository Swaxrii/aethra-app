# Aethra 2.0 — Current audit

Updated 9 November 2026 against commit `947e613` (`develop/v2`).
The previous `00`–`12` audits described an older local-demo version and were removed because they were stale and could mislead implementation. This directory is now a short, current audit.

## Read order

1. `01-architecture-backend-database.md`
2. `02-security.md`
3. `03-frontend-ux-qa-performance.md`

## Executive summary

Aethra 2.0 now has a functional PostgreSQL backend and connected frontend. Accounts, sessions, preferences, conversations, and messages persist server-side; ownership is enforced in every API; scripted assistant replies are clearly labeled. The critical risks from the old audits (local-only identity, shared browser data, no server ownership, no session security) are addressed.

Verified at the baseline commit: migrations apply cleanly, lint/unit tests/format/build pass, the PostgreSQL integration suite passes on dev and production servers, and browser flows were exercised end to end.

## Current risk ranking

| Priority | Finding | Status / action |
| --- | --- | --- |
| P1 | No email verification, password reset, or account deletion | Open; define before public production |
| P1 | No backup/restore or monitoring runbook | Open; operational work, not a code bug |
| P2 | Rate limiting and cleanup are app-local (`rate_limits`, opportunistic cleanup) | Acceptable for single-instance; revisit for scale |
| P2 | Proxy only checks cookie presence | By design; APIs enforce real auth |
| P2 | No MFA or re-authentication window beyond current password | Open product decision |
| P3 | Legacy browser import is manual and one-way | Intentional; documented in UI |
| P3 | No AI provider/streaming/Stop | Intentional demo scope |
| P3 | Limited automated browser tests | Integration + manual E2E only |

## What is verified, not assumed

- `npm run db:migrate`, `npm run lint`, `npm test`, `npm run format:check`, `npm run build`.
- `npm run test:integration` against `npm run dev` and `npm start`.
- Manual browser E2E for auth, chat, reply, settings, preferences, projects, search, rename, refresh, logout, protected redirect.
- Original database rows preserved; disposable test users deleted.

## Audit rules

- Re-verify any claim against current code and `git status`; do not trust old paths or line numbers.
- Do not reintroduce local-demo auth as the live identity.
- Do not weaken ownership checks, CSRF-origin validation, cookie flags, Argon2id, or rate limits.
- Update this directory when security, schema, or test commands change.
