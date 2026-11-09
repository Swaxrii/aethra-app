# Audit — frontend, UX, QA, performance

Updated 9 November 2026. Baseline `947e613`.

## Verdict

The approved cinematic design is preserved and now backed by real server data. Loading, empty, error, and saving states were added where flows were previously silent. Remaining work is mostly test depth, operational polish, and product features — not a redesign.

## Screen status

| Screen | Files | Current behavior |
| --- | --- | --- |
| Auth | `src/app/auth/page.jsx` | Login/register, validation, redirects authenticated users |
| Home | `src/app/page.jsx` | Creates server conversation; model preference; duplicate-send guard; disabled suggestions while sending |
| Chat | `src/app/chat/[id]/page.jsx` | History load, send, scripted reply, retry, copy, export, error clearing |
| Projects | `src/app/projects/page.jsx` | Server list, search, pagination, rename, delete, backup, explicit import, loading state |
| Search | `src/components/SearchModal.jsx` | Debounced server search, loading/empty/error states |
| Settings | `src/app/settings/page.jsx` | Profile/password, member-since/last-sign-in, preferences, saving/loading states |
| Navigation | `src/components/Sidebar.jsx` | Recents, account menu, logout only when authenticated, mobile drawer |

## UX strengths

- Consistent dark-first identity, system light theme, responsive layout, reduced-motion support.
- Destructive/ambiguous actions expose errors instead of failing silently.
- Demo responses are labeled as scripted, not AI-generated.
- Auth and protected pages redirect sensibly; session expiry surfaces as login.
- Forms prevent duplicate submissions and show progress.

## Accessibility checklist

- Dialog/search focus handling exists; verify focus return on close.
- Buttons have accessible names; icon-only controls need labels (send is labeled).
- Status messages use `role="status"` for loading where added.
- Forms use visible labels; errors should also be announced (verify live region coverage).
- Keyboard path for select/sidebar/search should be re-tested after any layout change.
- Color contrast in both themes should be spot-checked, especially muted text.
- Mobile drawer must trap focus and close on Escape.

## QA coverage

Verified manually: register, login, logout, protected redirect, create conversation, scripted reply, retry, rename, delete, search (title + message), settings save, preferences save, import/backup path, refresh persistence, desktop and mobile layout basics.

Automated: local unit tests plus PostgreSQL integration suite (see `tests/backend.integration.mjs`). No automated browser suite yet.

## Performance notes

- Conversation list is limited to 100 rows + `hasMore`; search uses indexed owner scope and `ILIKE`; message count is a correlated subquery.
- Chat loads the full message list; fine for current limits, but very long histories may need pagination.
- `pg` pool: max 10, 5s connect timeout, 30s idle timeout, global reuse in dev.
- No profiling was run; do not claim measured performance numbers.

## Recommendations

1. Add an automated browser smoke suite for the critical flows.
2. Paginate or lazy-load very long conversations if usage grows.
3. Add focus-return/Escape/live-region assertions for dialogs and forms.
4. Add monitoring for client errors and API 5xx/429 rates.
5. Keep visual changes within the approved identity; do not restore old plum/design experiments from removed audits.
