# Event Dashboard

Path: `web-application/event-dashboard`. Next.js 16 / React 19 / Tailwind 4.

> [!WARNING]
> [AGENTS.md](../web-application/event-dashboard/AGENTS.md) warns this Next.js version has breaking changes. Read `node_modules/next/dist/docs/` before changing framework-level code.

## Layout

```
src/app/
  page.tsx, layout.tsx, globals.css
  login/page.tsx              Supabase email/password login
  staff/page.tsx              Admin-only staff account manager (single + CSV import)
  checkin-success/page.tsx    Landing page after direct QR URL visit
  api/checkin/route.ts        GET ?r=<registrationId>: marks replied_scanned, redirects
  api/send-email/route.ts     POST: emails QR passes via Resend (auth required)
  api/staff/route.ts          GET/POST/PATCH: staff user CRUD via Supabase Auth admin API
src/components/
  Dashboard.tsx               Main admin UI (categories, events, customers, prizes, modals)
  AuthGuard.tsx               Verifies active session AND staff.role === 'admin'
src/lib/
  supabase.ts                 Anon client (browser)
  supabase-admin.ts           Service-role client (server only)
  resend.ts, url.ts           Resend client; siteUrl from SITE_URL
```

## Dashboard features

- **Role Guard (`AuthGuard.tsx`):** Checks both Supabase session and `public.staff` (`role === 'admin' && active`). Guards or users without a staff row see a "No access" screen with a sign-out button.
- **Category & Event Pickers:** Select or create categories and events.
- **Customers Tab:**
  - **CSV Import:** Headers are trimmed and lower-cased. Requires `name` and `email`; `ticket_code`/`ticket` optional. Deduplicates by email, chunks in batches of 500, and generates equal-length numeric codes (`generateCodes`) when missing.
  - **Edit Customer Modal (Pencil icon):** Edit `name`, `phone`, `ticket_code`, and `status` (`imported`, `email_sent`, `replied_scanned`). `email` is read-only.
    - `name` and `phone` update the shared `customers` record.
    - `ticket_code` and `status` update `event_registrations`.
    - Changing status to `replied_scanned` sets `scanned_at = now()` (manual verify for lucky draw eligibility); reverting status clears `scanned_at`.
    - Validates uniqueness of `ticket_code` within the event and warns via confirmation dialog if the new code length differs from existing tickets.
  - **Send Pass Email Modal:** Sends QR pass emails with `{{name}}` and `{{ticket}}` placeholders to selected registrations.
- **Prize Pools Tab:** Create prizes manually, import via CSV (`name`, `image_url`/`imageUrl`, `quantity`), or delete prizes (blocked if winners already exist).
- **Staff Accounts Page (`/staff`):**
  - Linked from the Dashboard header (`Staff` button).
  - Create single accounts or bulk-import via CSV (`email`, `full_name`/`name`, `role` (`guard` or `admin`), optional `password`).
  - Auto-generates an 8+ char password when omitted and provides a one-time **Download credentials CSV** button.
  - Toggle `role` (`guard` ↔ `admin`), toggle `active`, or reset passwords inline. Self-demotion and self-deactivation are blocked.

## API Routes

### `GET | POST | PATCH /api/staff`
Requires `Authorization: Bearer <access_token>` belonging to an active `admin` in `public.staff`. Uses `supabaseAdmin.auth.admin` to create/list/update Supabase Auth users and syncs rows in `public.staff`.

### `POST /api/send-email`
Headers: `Authorization: Bearer <supabase access token>`. Body: `{ registrationIds: string[], customBody: string }`. Returns `{ success, count, failed: [{email, reason}] }`. Sender is `onboarding@resend.dev`. Subject is fixed to `"Your check-in pass"`.

### `GET /api/checkin?r=<uuid>`
400 on a bad ID, 404 if not found, else sets `status = 'replied_scanned'` and `scanned_at` (first scan only) and redirects to `/checkin-success`.
