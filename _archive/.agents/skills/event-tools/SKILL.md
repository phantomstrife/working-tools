---
name: event-tools
description: >-
  Project knowledge and UI/UX guidelines for the event-tools monorepo (Event
  Dashboard on Next.js, Lucky Draw & Gate Check-in on Electron, VDJ Show
  Control). Use when changing guest import, customer editing, staff accounts,
  QR check-in, email passes, prize pools, lucky-draw logic, Supabase schema/RPCs,
  VirtualDJ display, or building/updating any UI.
---

# event-tools

Read `docs/architecture.md` first for the data model and flow, and **always read `docs/ui-ux-guide.md` before creating or modifying any UI**.

## Map

| Task | Look at |
| --- | --- |
| UI/UX design tokens, layout & interaction rules | `docs/ui-ux-guide.md` |
| Customer/prize import, customer edit, admin UI | `web-application/event-dashboard/src/components/Dashboard.tsx` |
| Staff accounts UI & CSV import (admin only) | `web-application/event-dashboard/src/app/staff/page.tsx` |
| Staff accounts API (`auth.admin` + `staff` table) | `web-application/event-dashboard/src/app/api/staff/route.ts` |
| Dashboard admin role guard | `web-application/event-dashboard/src/components/AuthGuard.tsx` |
| Email with QR pass | `web-application/event-dashboard/src/app/api/send-email/route.ts` |
| Direct QR check-in URL | `web-application/event-dashboard/src/app/api/checkin/route.ts` |
| Lucky Draw role router (`admin` vs `guard`) | `lucky-draw/src/renderer/src/components/RoleRouter.tsx`, `hooks/useStaffRole.ts` |
| Guard Gate check-in (QR scan + search + confirm) | `lucky-draw/src/renderer/src/components/Gate/GatePage.tsx`, `Gate/QrScanner.tsx` |
| Draw logic, modes, DB writes | `lucky-draw/src/renderer/src/stores/lucky-draw.ts` |
| Stage visuals | `lucky-draw/src/renderer/src/components/LuckyDraw/theme-02/` |
| Operator panel | `lucky-draw/src/renderer/src/components/EventLoader.tsx` |
| Supabase migrations & Gate RPCs | `supabase/migrations/20261019_staff_and_gate_checkin.sql` |
| Electron main/preload/IPC | `lucky-draw/src/main/index.ts`, `src/preload/index.ts` |
| VirtualDJ | `web-application/virtualdj` (follow its README "Extending") |

## Core Rules

1. **Shared Supabase Schema:** Dashboard and Lucky Draw share `categories`, `events`, `customers`, `event_registrations`, `prize_pools`, `staff`, and `checkin_logs`. Check both apps when changing columns or status values.
2. **Registration Status Flow:** `imported` → `email_sent` → `replied_scanned`. The lucky draw only includes `replied_scanned`. Automated email sends and gate scans must never downgrade an already-checked-in guest (only explicit admin customer edits in `Dashboard.tsx` may revert status).
3. **Ticket Code Length Invariant:** Ticket codes within an event must stay the same length because the slot machine renders one reel per character. Warn the admin if a manual edit changes code length.
4. **Winner Persistence:** Winner writes in `lucky-draw.ts` must be DB-first and guarded with `.is('prize_pool_id', null)`. Hide the winner from stage lists/counters while `isSpinning` is true (spoiler protection).
5. **Role Separation & Gate RPCs:**
   - Roles live in `public.staff` (`admin` or `guard`, plus `active`).
   - Dashboard pages require `admin`; Lucky Draw routes `guard` accounts strictly to `GatePage`.
   - Gate check-ins go through the `lookup_registration`, `search_registrations`, and `confirm_checkin` RPCs (`supabase/migrations/20261019_staff_and_gate_checkin.sql`), which record `checked_in_by`, `check_in_method` (`qr` | `manual`), and `checkin_logs`.
   - In Postgres `returns table(...)` functions, explicitly cast every SELECT column (`::text`) so `varchar`/`timestamp` columns never trigger Postgres error `42804`.
6. **Camera / Non-Secure Origin Safety:** Always guard `navigator.mediaDevices?.getUserMedia` in renderer code so opening the app over plain HTTP (`http://192.168.x.x:5173`) shows a clean fallback notice instead of crashing React.
7. **Secrets & Security:** `SUPABASE_SERVICE_ROLE_KEY` and `RESEND_API_KEY` stay strictly in Next.js API routes. Escape user text in email HTML (`escapeHtml`) before placeholder substitution.
8. **Next.js 16:** Read `node_modules/next/dist/docs/` before framework-level edits in `event-dashboard`.
9. **UI & UX Standards (`docs/ui-ux-guide.md`):**
   - Dark Slate Console palette (`bg-slate-900`, cards `bg-slate-800 border-slate-700`, Indigo accent for Dashboard, Gold/Amber accent for Lucky Draw/Gate).
   - Use `font-mono` for ticket codes/passwords/UUIDs and `tabular-nums` for counters/timers.
   - Prefer inline banners, toasts, and accessible modals over browser `alert()`, `confirm()`, and `prompt()`.
   - Stage board (`LuckyDrawBoard`) copy is Vietnamese; operator panel, Gate screen, and Dashboard copy are English.

## Verify

- Dashboard: `npx tsc --noEmit && npm run lint` (in `web-application/event-dashboard`).
- Lucky Draw: `npm run typecheck && npm run lint` (in `lucky-draw`).
- VDJ: `npm run typecheck && npm test` (in `web-application/virtualdj`).
