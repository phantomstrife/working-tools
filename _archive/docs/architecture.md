# Architecture

## Components

- **Event Dashboard** (Next.js App Router): admin back-office UI (`/` and `/staff`) plus server API routes that require secrets (`SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`).
- **Lucky Draw & Gate** (Electron + Vite/React): role-routed app.
  - **Admins** see the stage slot-machine draw board (`LuckyDrawBoard` + `EventLoader`) and can switch to the Gate view.
  - **Guards** (`role = 'guard'`) are routed strictly to the **Gate Check-in** screen (`GatePage`) to scan guest QR codes or search registrations and confirm check-ins.
- **VDJ Show Control**: standalone; see [virtualdj.md](virtualdj.md).

## Data model (Supabase)

Migration file: [supabase/migrations/20261019_staff_and_gate_checkin.sql](../supabase/migrations/20261019_staff_and_gate_checkin.sql).

| Table | Columns used | Notes |
| --- | --- | --- |
| `categories` | `id`, `name` | Top-level grouping of events |
| `events` | `id`, `category_id`, `title` | Belongs to a category |
| `customers` | `id`, `name`, `email`, `phone` | `email` is unique and is the identity (upsert `onConflict: 'email'`) |
| `event_registrations` | `id`, `event_id`, `customer_id`, `ticket_code`, `status`, `scanned_at`, `checked_in_by`, `check_in_method`, `drawn_at`, `prize_pool_id`, `created_at` | Unique on `(event_id, customer_id)`; `id` is encoded in the QR URL |
| `prize_pools` | `id`, `event_id`, `name`, `image_url`, `quantity`, `created_at` | Prizes configured per event |
| `staff` | `user_id`, `full_name`, `role`, `active`, `created_at` | `user_id` references `auth.users(id)`. `role` is `'admin'` or `'guard'` |
| `checkin_logs` | `id`, `registration_id`, `event_id`, `staff_id`, `method`, `result`, `created_at` | Audit trail of every gate check-in attempt (`checked_in`, `already_checked_in`, `not_found`) |

Registration `status` lifecycle: `imported` → `email_sent` → `replied_scanned` (checked in). A winner is a registration with `prize_pool_id` set and `drawn_at`.

## Gate RPCs (`security definer`)

Defined in [20261019_staff_and_gate_checkin.sql](../supabase/migrations/20261019_staff_and_gate_checkin.sql). All three verify `public.current_staff_role() is not null` (caller must be an active `admin` or `guard`) and return `text`-cast columns to avoid PostgreSQL `42804` type-mismatch errors across `varchar`/`timestamp`/`uuid` column definitions:

- `lookup_registration(p_registration_id text)`: looks up a single registration by ID with customer, event title, and previous check-in staff/method.
- `search_registrations(p_event_id text, p_query text)`: multi-word case-insensitive search within an event across `c.name`, `c.email`, `c.phone`, `r.ticket_code`, and `r.status` (up to 50 rows).
- `confirm_checkin(p_registration_id text, p_method text default 'qr')`: atomically transitions `status` to `'replied_scanned'`, sets `scanned_at`, `checked_in_by = auth.uid()`, and `check_in_method` (`'qr'` or `'manual'`), and appends a row to `checkin_logs`. Never overwrites an existing check-in.

## End-to-end flow

1. **Setup:** Admin creates category and event, adds prizes (form or CSV `name,image_url,quantity`), and creates guard accounts in `/staff` (form or CSV `email,full_name,role,password`).
2. **Guest Import:** Admin imports customers by CSV (`name`, `email`, optional `ticket_code`). Customers are upserted, registrations created, and same-length numeric ticket codes generated.
3. **Pass Dispatch:** Admin selects registrations and sends emails via `/api/send-email`. Each email embeds a QR code pointing to `${SITE_URL}/api/checkin?r=<registrationId>`.
4. **Check-in (3 paths):**
   - **Gate QR Scan:** Guard logs into the Lucky Draw app, selects the event, scans the guest's QR code, reviews the guest card, and clicks **Confirm check-in** (`method = 'qr'`).
   - **Gate Search:** If a guest forgot their email, the guard searches by name/email/phone/ticket code, selects the guest, and clicks **Confirm check-in** (`method = 'manual'`).
   - **Admin Manual Override:** Admin edits any customer row in the Dashboard (pencil button) and changes `status` to `replied_scanned` (or edits name, phone, ticket code).
5. **Lucky Draw:** Admin on the stage machine loads checked-in registrations (`status = replied_scanned`) for the chosen event and draws winners.

## Key invariants

- All ticket codes in an event should have the **same length**. The Lucky Draw reels render one reel per character of the code (editing a customer's ticket code to a different length warns the admin).
- A draw writes to the DB first, then animates. `markAsDrawn` uses `.is('prize_pool_id', null)` so a registration can't win twice.
- A prize with winners can't be deleted from the dashboard.
- Gate `confirm_checkin` never overwrites an earlier check-in; email send never downgrades `replied_scanned`.
- Email bodies are HTML-escaped before `{{name}}` / `{{ticket}}` substitution.
- Sending is throttled at 600 ms/email for Resend's rate limit.

> [!WARNING]
> `GET /api/checkin?r=<id>` (the URL encoded inside the QR image) still marks a registration as `replied_scanned` without authentication if opened directly in a browser. Guards should scan the QR via the Gate screen so `checked_in_by` and `checkin_logs` are recorded.
