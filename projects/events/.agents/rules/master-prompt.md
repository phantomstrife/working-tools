# MASTER PROMPT: Multi-Tenant Event & Game Management Ecosystem

## 1. Role & Objective

You are a Principal Full-Stack Architect and Lead Engineer. We are building a multi-tenant Event & Interactive Game Ecosystem consisting of a Web CMS (`[ADMIN_WEB]`) and a Desktop Application (`[CLIENT_APP]`).

Your goal is to help me design, architect, and write production-ready, modular code step-by-step. Follow strict role-based access control (RBAC), clean relational database design, and a modular plugin-style architecture so new games can be added effortlessly in the future.

---

## 2. System Applications & Tech Stack

1. **`[ADMIN_WEB]` (CMS & Management Portal)**
   - **Framework:** Next.js (App Router, TypeScript, Tailwind CSS).
   - **Purpose:** Used by `[SUPER_ADMIN]` and `[ADMIN]` to manage accounts, companies, events, game configurations, attendee imports, batch email/QR dispatches, audit logs, and Excel report exports.
2. **`[CLIENT_APP]` (Field & Venue Desktop App)**
   - **Framework:** Electron (with React/TypeScript frontend).
   - **Purpose:** Used on-site at events by:
      - `[GUARD]`: To check in `[CUSTOMER]`s via QR Code scanner or manual lookup tool.
      - `[FIELD_STAFF]`: To launch and display interactive `[GAMES]` on big screens for `[CUSTOMER]`s to play along in real time.

---

## 3. Stakeholders & Entities

- **`[DEV]`**: The development team building and maintaining the entire ecosystem.
- **`[MANAGER]`**: The client/organization renting the platform to host and manage their events.
- **`[CUSTOMER]`**: Event attendees who check in at the venue and participate in `[GAMES]`. (Customers do not have login accounts; they are tracked as event/game attendees).

---

## 4. Roles & Permissions (RBAC)

Every user of `[ADMIN_WEB]` and `[CLIENT_APP]` authenticates via the `[ACCOUNTS]` table:

| Role              | Stakeholder    | App Access                    | Core Permissions & Restrictions                                                                                                                                          |
| :---------------- | :------------- | :---------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`SUPER_ADMIN`** | `[DEV]`        | `[ADMIN_WEB]`, `[CLIENT_APP]` | Full system access. Only role allowed to create `[ADMIN]` accounts. Exclusive access to in-development/beta features deployed to the test/prod server via feature flags. |
| **`ADMIN`**       | `[MANAGER]`    | `[ADMIN_WEB]`                 | Manages their own `[COMPANIES]`, `[EVENTS]`, and `[GAMES]`. Can create and assign `[FIELD_STAFF]` and `[GUARD]` accounts. Restricted from dev-only features.             |
| **`FIELD_STAFF`** | On-site Staff  | `[CLIENT_APP]`                | Can only view and launch `[EVENTS]` and `[GAMES]` explicitly assigned to their account. Operates the live game screen (e.g., spinning the Lucky Draw).                   |
| **`GUARD`**       | Venue Security | `[CLIENT_APP]`                | Accesses the Check-In Tool for assigned `[EVENTS]`/`[GAMES]`. Scans QR codes or manually searches `[CUSTOMER]` details to mark them as checked in.                       |

---

## 5. Database Schema Specification

### 5.1 Core Ecosystem Tables

1. **`accounts`**
   - `id` (UUID, PK)
   - `username` / `email` (Unique)
   - `password_hash`
   - `full_name`, `phone`
   - `role` (ENUM: `SUPER_ADMIN`, `ADMIN`, `FIELD_STAFF`, `GUARD`)
   - `company_id` (UUID, FK -> `companies.id`, nullable for `SUPER_ADMIN`)
   - `created_by` (UUID, FK -> `accounts.id`)
   - `is_active` (Boolean)
   - `created_at`, `updated_at`

2. **`companies`** (1 Company : N Events)
   - `id` (UUID, PK)
   - `name`, `tax_code`, `industry`
   - `contact_person`, `contact_email`, `contact_phone`
   - `address`, `logo_url`
   - `status` (ENUM: `ACTIVE`, `INACTIVE`, `SUSPENDED`)
   - `created_by` (UUID, FK -> `accounts.id`)
   - `created_at`, `updated_at`

3. **`events`** (1 Event : N Games)
   - `id` (UUID, PK)
   - `company_id` (UUID, FK -> `companies.id`)
   - `name`, `slug`, `description`
   - `location_name`, `location_address`
   - `start_time`, `end_time`
   - `banner_url`, `theme_config` (JSONB for custom branding)
   - `status` (ENUM: `DRAFT`, `UPCOMING`, `ONGOING`, `COMPLETED`, `CANCELLED`)
   - `created_at`, `updated_at`

4. **`games`** (1 Game : N Accounts via Junction)
   - `id` (UUID, PK)
   - `event_id` (UUID, FK -> `events.id`)
   - `name`, `description`
   - `game_type` (ENUM: `LUCKY_DRAW`, ...future games)
   - `config` (JSONB for UI settings, animations, rules)
   - `is_dev_only` (Boolean - if true, only `SUPER_ADMIN` can view/configure)
   - `status` (ENUM: `PENDING`, `READY`, `LIVE`, `FINISHED`)
   - `created_at`, `updated_at`

5. **`game_accounts`** (Many-to-Many Junction: Assigns Staff/Guards to Games/Events)
   - `id` (UUID, PK)
   - `game_id` (UUID, FK -> `games.id`)
   - `event_id` (UUID, FK -> `events.id`)
   - `account_id` (UUID, FK -> `accounts.id`)
   - `assigned_at`

6. **`logs`** (Immutable Audit Trail)
   - `id` (UUID, PK)
   - `account_id` (UUID, FK -> `accounts.id`)
   - `event_id` (UUID, FK -> `events.id`, nullable)
   - `game_id` (UUID, FK -> `games.id`, nullable)
   - `action_type` (ENUM: `AUTH_LOGIN`, `ACCOUNT_CREATE`, `EMAIL_BATCH_SEND`, `CHECKIN_QR_SCAN`, `CHECKIN_MANUAL_SEARCH`, `PRIZE_DRAWN`, `REPORT_EXPORT`)
   - `target_entity` (String, e.g., table name)
   - `target_id` (String/UUID)
   - `metadata` (JSONB - stores before/after snapshots, search query used by Guard, failure reasons, IP/device info)
   - `created_at`

---

### 5.2 Game Module #1: `[LUCKY_DRAW]`

_Architectural Rule: All tables supporting a specific game MUST be prefixed with that game's identifier (`lucky_draw_`)._

1. **`lucky_draw_prizes`**
   - `id` (UUID, PK)
   - `game_id` (UUID, FK -> `games.id`)
   - `name` (e.g., "First Prize - iPhone 16 Pro")
   - `description`, `image_url`
   - `tier_order` (Int - controls draw sequence)
   - `total_quantity` (Int, Constraint: `>= 1`)
   - `remaining_quantity` (Int, Constraint: `>= 0` and `<= total_quantity`)
   - `created_at`, `updated_at`

2. **`lucky_draw_attendants`**
   - `id` (UUID, PK)
   - `game_id` (UUID, FK -> `games.id`)
   - `Attendee Info`: `full_name`, `email`, `phone`, `ticket_code` (Unique per game), `company_name`, `department`, `custom_metadata` (JSONB for extra CSV columns)
   - `qr_code_payload` (Unique encrypted/signed token for QR generation)
   - `email_status` (ENUM: `NOT_SENT`, `SENDING`, `SENT`, `FAILED`)
   - `email_sent_at` (Timestamp, nullable)
   - `is_checked_in` (Boolean, default `false`)
   - `checked_in_at` (Timestamp, nullable)
   - `checked_in_by` (UUID, FK -> `accounts.id`, nullable)
   - `check_in_method` (ENUM: `QR_SCAN`, `MANUAL_SEARCH`, nullable)
   - `has_won` (Boolean, default `false` - prevents winning multiple times unless configured otherwise)
   - `created_at`, `updated_at`

3. **`lucky_draw_winners`**
   - `id` (UUID, PK)
   - `game_id` (UUID, FK -> `games.id`)
   - `prize_id` (UUID, FK -> `lucky_draw_prizes.id`)
   - `attendant_id` (UUID, FK -> `lucky_draw_attendants.id`)
   - `drawn_by` (UUID, FK -> `accounts.id` - the `FIELD_STAFF` who executed the draw)
   - `won_at` (Timestamp)

---

## 6. Core Application Flows

### 6.1 `[ADMIN_WEB]` Dashboard Setup Flow

1. **Authentication & Feature Gating:** Only `SUPER_ADMIN` and `ADMIN` can log into `[ADMIN_WEB]`. Features flagged as `is_dev_only` are strictly hidden from `ADMIN`.
   - `SUPER_ADMIN` accounts bypass company-specific routing and are directed to the global `[ADMIN_WEB]` dashboard (/admin/dashboard) to view system-wide statistics.
   - `ADMIN` accounts must be strictly bound to a company_id. Upon successful login, an ADMIN is immediately redirected to their specific company management page (e.g., /companies/[company_id]).
2. **Account Provisioning:**
   - `SUPER_ADMIN` creates `ADMIN` accounts.
   - `ADMIN` creates `FIELD_STAFF` and `GUARD` accounts and distributes credentials to staff.
3. **Company & Event Setup:**
   - `ADMIN` creates a `[COMPANY]` profile.
   - `ADMIN` creates an `[EVENT]` under that company and assigns `FIELD_STAFF` and `GUARD` accounts to it.
4. **Game Initialization:**
   - `ADMIN` creates a `[GAME]` of type `LUCKY_DRAW` inside the `[EVENT]`.

### 6.2 `[LUCKY_DRAW]` End-to-End Operational Flow

1. **Prize Configuration (`[ADMIN_WEB]`):**
   - `ADMIN` imports (CSV/Excel) or manually adds items to `lucky_draw_prizes`. Every prize must have `total_quantity >= 1`.
2. **Attendant Import (`[ADMIN_WEB]`):**
   - `ADMIN` bulk-imports attendees via CSV provided by `[MANAGER]` OR adds individual attendees via a manual form into `lucky_draw_attendants`. Each record generates a unique `qr_code_payload`.
3. **Batch Email & QR Dispatch (`[ADMIN_WEB]`):**
   - `ADMIN` selects specific attendants (or "Select All") and triggers the **Send Email** action.
   - System sends customized emails (Subject, HTML Body, embedded unique QR Code image) and updates `email_status`.
4. **On-Site Venue Check-In (`[CLIENT_APP]` - `GUARD` Role):**
   - `GUARD` logs into `[CLIENT_APP]` and opens the Check-In Tool for the active event/game.
   - **Path A (QR Scan):** `GUARD` scans the `[CUSTOMER]`'s QR code. System validates the token, marks `is_checked_in = true`, sets `check_in_method = 'QR_SCAN'`, and writes an entry to `logs` with `action_type = 'CHECKIN_QR_SCAN'`.
   - **Path B (Manual Lookup):** If `[CUSTOMER]` forgot their QR code, `GUARD` searches by name, phone, email, or ticket code. Upon verifying identity, `GUARD` clicks check-in. System sets `is_checked_in = true`, `check_in_method = 'MANUAL_SEARCH'`, and writes an entry to `logs` with `action_type = 'CHECKIN_MANUAL_SEARCH'` (including the search query in `metadata` for audit/debugging).
   - _Rule:_ Only attendants with `is_checked_in == true` are eligible to enter the `[LUCKY_DRAW]` pool.
5. **Live Lucky Draw Execution (`[CLIENT_APP]` - `FIELD_STAFF` Role):**
   - `FIELD_STAFF` logs into `[CLIENT_APP]` and launches the `[LUCKY_DRAW]` presentation view.
   - System loads available `lucky_draw_prizes` (where `remaining_quantity > 0`) and eligible `lucky_draw_attendants` (`is_checked_in == true` AND `has_won == false`).
   - When a draw completes for a selected prize:
      - Perform an atomic DB transaction: Insert record into `lucky_draw_winners`, decrement `lucky_draw_prizes.remaining_quantity` by 1, mark `lucky_draw_attendants.has_won = true`, and write to `logs` (`PRIZE_DRAWN`).
      - Repeat until `remaining_quantity == 0` across all prizes.
6. **Post-Event Export (`[ADMIN_WEB]`):**
   - `ADMIN` exports the final results (`lucky_draw_winners` joined with attendant and prize details, plus check-in audit data) to an Excel (`.xlsx`) file formatted to `[MANAGER]`'s specification.

---

## 7. Extensibility & Working Instructions

- **Future Games:** The database, API routes, and Electron state management must isolate game-specific logic into modular namespaces (e.g., `/modules/games/lucky-draw/`) so incoming games (e.g., Quiz, Bingo, Voting) can be plugged in without refactoring core `[EVENTS]` or `[ACCOUNTS]` logic.
- **Code-First & Step-by-Step Execution:** Do not generate the entire codebase at once. Wait for my command on which step or module to build first, propose the file structure for that specific step, and write clean, strongly typed code.
