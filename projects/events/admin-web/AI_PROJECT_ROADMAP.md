# Project Roadmap & Business Requirements (`ROADMAP.md`)

## 1. Product Vision & Ecosystem Overview

We are building a Multi-Tenant Event & Interactive Game Ecosystem. The platform allows corporate clients (`[MANAGER]`) to manage events, import attendees, dispatch QR codes, and host live interactive games (like Lucky Draws) at physical venues.

The ecosystem is divided into two distinct applications:

1. **`[ADMIN_WEB]` (Next.js CMS):** The cloud dashboard where configuration, attendee management, and post-event reporting happen.
2. **`[CLIENT_APP]` (Electron Desktop):** The on-site software used at the physical venue for checking in guests and presenting the live interactive games on big screens.

---

## 2. Stakeholders & RBAC (Role-Based Access Control)

Every feature built must respect these strict tenant and role boundaries:

- **`SUPER_ADMIN` (System Devs):** Has global access to all companies. Can see `is_dev_only` features and games currently in beta.
- **`ADMIN` (Client Managers):** Strictly scoped to their `company_id`. They manage their own Events, Prizes, and Attendees. They create sub-accounts for their on-site staff.
- **`FIELD_STAFF` (On-site Game Operator):** Logs into `[CLIENT_APP]`. Can only launch the live presentation screen for Events/Games explicitly assigned to them.
- **`GUARD` (On-site Security):** Logs into `[CLIENT_APP]`. Accesses the Check-In tool to scan QR codes or manually look up attendees.

---

## 3. Implementation Roadmap: `[ADMIN_WEB]` (Next.js CMS)

### Phase 1: Core Multi-Tenant Foundation

- **Auth Module (`modules/authorize`):**
   - Login & Forget Password flows.
   - Strict redirect logic (Guards & Field Staff cannot log into the CMS).
- **Companies Module (`modules/admin/pages/company`):**
   - `search/`: DataTable to list companies (Super Admin only).
   - `upsert/`: Form to configure company details, tax codes, and branding.
- **Accounts Module (`modules/admin/pages/account`):**
   - `search/` & `upsert/`: Allows Admins to create `GUARD` and `FIELD_STAFF` credentials for their events.
- **Events Module (`modules/admin/pages/event`):**
   - `search/` & `upsert/`: Manage event dates, locations, and custom JSON theming/branding.
- **Audit Logs (`modules/admin/pages/log`):**
   - `search/` ONLY (Immutable): A read-only DataTable showing an audit trail of every login, QR scan, and prize drawn.

### Phase 2: Game Engine & `[LUCKY_DRAW]`

All game-specific features must be modularized and prefixed with `lucky_draw_`.

- **Game Initialization (`modules/admin/pages/games`):**
   - `search/` & `upsert/`: Assigning a Game (e.g., Lucky Draw) to an Event.
- **Prize Configuration (`lucky_draw_prizes`):**
   - `search/` & `upsert/`: Define prizes, images, tier order, and strictly enforce `total_quantity >= 1`.
- **Attendant Management (`lucky_draw_attendants`):**
   - `search/`: DataTable for attendees. MUST include a Bulk Action to **Send Batch Emails**.
   - `upsert/`: Manual add/edit of attendees.
   - **CSV Import/Export**: Ability to bulk-import CSVs of attendees (mapping name, email, ticket code) and generate unique `qr_code_payload` hashes for each.
- **Post-Event Reporting (`lucky_draw_winners`):**
   - `search/`: View-only DataTable joining Winners, Prizes, and Attendees. MUST include an "Export to Excel" feature for the client.

---

## 4. Implementation Roadmap: `[CLIENT_APP]` (Electron)

_(Note: These features apply to the `client-web` repo, not the Next.js CMS)._

### Phase 3: Venue Operations

- **The Check-In Tool (For `GUARD`):**
   - **QR Scanner Mode:** Reads `qr_code_payload`, validates it against the DB, and atomically updates `is_checked_in = true`. Logs `CHECKIN_QR_SCAN`.
   - **Manual Lookup Mode:** A search bar to find attendees by name/phone/email if they lost their QR code. Logs `CHECKIN_MANUAL_SEARCH`.
- **The Live Game Presentation (For `FIELD_STAFF`):**
   - A highly animated, full-screen UI.
   - **Eligibility Engine:** Only loads attendants where `is_checked_in == true` AND `has_won == false`.
   - **Atomic Draw Engine:** When a winner is selected, the system MUST execute an atomic database transaction to:
      1. Insert into `lucky_draw_winners`.
      2. Decrement `lucky_draw_prizes.remaining_quantity` by 1.
      3. Set `lucky_draw_attendants.has_won = true`.
      4. Write a `PRIZE_DRAWN` audit log.

---

## 5. Critical Business Logic / Gotchas

1. **Never leak data:** Always enforce `company_id` scoping on database reads/writes for the `ADMIN` role.
2. **Race Conditions:** A prize's `remaining_quantity` must never drop below 0. Live game updates must rely on atomic SQL decrements, not client-side math.
3. **Check-In Dependency:** An attendee CANNOT win a game if they have not been physically checked in by a `GUARD`. Ensure queries enforce `is_checked_in = true`.
