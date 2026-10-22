# Development Guide

## Commands

| Project | Dev | Check | Build |
| --- | --- | --- | --- |
| `web-application/event-dashboard` | `npm run dev` | `npm run lint`, `npx tsc --noEmit` | `npm run build` |
| `lucky-draw` | `npm run dev` | `npm run typecheck`, `npm run lint` | `npm run build:win` |
| `web-application/virtualdj` | see [virtualdj.md](virtualdj.md) | `npm run typecheck`, `npm test` | `npm run build` |

Each project has its own `package.json` and `node_modules`; there is no root workspace.

## Database Migrations

SQL migrations live in `supabase/migrations/`:
- [20261019_staff_and_gate_checkin.sql](../supabase/migrations/20261019_staff_and_gate_checkin.sql): creates `public.staff`, `public.checkin_logs`, adds `checked_in_by` / `check_in_method` to `event_registrations`, and defines the Gate RPCs (`current_staff_role`, `lookup_registration`, `search_registrations`, `confirm_checkin`).
- Run migrations in the **Supabase SQL Editor** before using `/staff` or the Lucky Draw app.

## Conventions

- TypeScript throughout. Formatting is Prettier with 3-space indentation in `lucky-draw` and `event-dashboard`.
- Follow [docs/ui-ux-guide.md](ui-ux-guide.md) when creating or updating any UI components.
- Supabase: browser/renderer code uses the anon key only. Privileged operations (`auth.admin.*`, bypassing RLS) go in Next.js API routes using `supabaseAdmin` or in `security definer` Postgres functions that check `public.current_staff_role()`.
- In PostgreSQL `returns table(...)` RPCs, always cast returned columns explicitly (`::text`) and `drop function if exists` before changing return signatures to avoid PostgreSQL error `42804` (`structure of query does not match function result type`).
- Keep ticket codes equal-length per event.
- When writing winners, guard with `.is('prize_pool_id', null)`.

## Gotchas

- **Camera over LAN IP (`http://192.168.x.x:5173`):** Browsers only expose `navigator.mediaDevices.getUserMedia` on `localhost` or `https://`. `QrScanner.tsx` gracefully degrades on plain HTTP so the search UI keeps working, but to scan QR codes from another device on the LAN you must either:
  1. Serve the renderer over HTTPS (e.g., `@vitejs/plugin-basic-ssl`),
  2. Enable `chrome://flags/#unsafely-treat-insecure-origin-as-secure` for `http://192.168.x.x:5173` on the test device, or
  3. Run the packaged Electron desktop build.
- **Windows Git ownership:** If `git` reports "dubious ownership", run `git config --global --add safe.directory E:/event-tools`.
- **Dashboard `SITE_URL`:** Must be reachable if guests ever open the QR link directly (default is `http://localhost:3000`). Note that the Gate QR scanner extracts the `?r=<uuid>` parameter directly from the QR string, so it works regardless of `SITE_URL` host.
- **Resend sandbox sender:** `onboarding@resend.dev` can only email verified addresses; configure a verified domain in production.
- **Email custom subject:** Dashboard `/api/send-email` currently hardcodes the subject `"Your check-in pass"` and ignores `customSubject`.
- **Legacy files:** `lucky-draw/src/renderer/src/components/DataManager.tsx` and `resources/mockup-data` are not used by the live Supabase flow.
