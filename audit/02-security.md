# Audit — security

Updated 9 November 2026. Baseline `947e613`.

## Verdict

The active routes have a sound baseline for this stage: server sessions, Argon2id, same-origin mutation checks, ownership enforcement, validation, generic errors, rate limiting, and security headers. Remaining gaps are product/operational, not currently exploited holes in the implemented flows.

## Controls present

| Area | Implementation |
| --- | --- |
| Passwords | Argon2id; 12–128 chars at register; dummy verify for unknown email |
| Sessions | 32-byte random token; SHA-256 hash at rest; HttpOnly, SameSite=Lax, Secure in production, Path=/, 14 days |
| Authorization | `currentUser()` per request; every conversation/message query filtered by `userId`; foreign IDs return 404 |
| CSRF | Same-origin `Origin` + rejection when `Sec-Fetch-Site: cross-site`; no state-changing GET |
| Rate limits | DB-backed, 15-minute windows, hashed identifiers: login email/IP, register email/IP, create/message/reply/import/profile |
| Input limits | Body size caps; email/name/password/title/content/model/temperature/length validation; UUID checks |
| Role integrity | Client cannot create `role: "ai"`; only reply route creates assistant messages |
| Sensitive changes | Email/password changes require current password and revoke other sessions |
| Error handling | Generic `{ error }`; no stack/SQL/provider leakage; 503 fallback |
| Headers | nosniff, frame DENY, referrer policy, permissions policy, same-origin opener, HSTS |
| Secrets | `DATABASE_URL` only in ignored `.env.local`; never in source/docs |

## Verified tests

- Origin/CSRF rejection for mutating request without `Origin`.
- Cookie flags (`HttpOnly`, `SameSite=Lax`, `Path=/`).
- Unauthenticated API access returns 401.
- Cross-account conversation/preferences access blocked (404/isolated data).
- Client attempts to inject `role: "ai"` return 403.
- Duplicate reply without a pending user message returns 409.
- Invalid UUID returns 404.
- Invalid model/temperature/empty prompt rejected with 400.
- Search wildcard `%` does not enumerate unrelated data.
- Profile update without current password for sensitive change does not work; non-sensitive name-only update works.
- Integration suite creates and deletes disposable users only.

## Open risks

| Priority | Risk | Recommendation |
| --- | --- | --- |
| P1 | No email verification | Add token-based verification before public launch |
| P1 | No password reset / account recovery | Add secure, expiring, single-use reset flow |
| P1 | No account deletion/export policy | Define and implement |
| P2 | No MFA | Product decision; recommend TOTP for sensitive accounts |
| P2 | Rate limiter is app-local PostgreSQL | Acceptable now; move to shared store if multi-instance |
| P2 | No monitoring/alerting for auth abuse | Add logs/metrics for 401/403/429 and failures |
| P3 | Proxy is cookie-presence only | Keep API authorization as the real boundary; do not rely on proxy |
| P3 | HSTS is sent in dev too | Harmless locally; ensure production is HTTPS-only |

## Rules for future changes

- Never expose `passwordHash`, session token, `DATABASE_URL`, or raw database errors.
- Do not remove owner filters or origin checks for convenience.
- Do not accept client-provided user IDs or assistant roles.
- Any new mutation needs validation, origin check, auth, and a rate limit if abusable.
- Any new secret stays in ignored env only; never in client bundles or docs.
