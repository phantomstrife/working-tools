# Lucky Draw & Gate Check-in

Path: `lucky-draw`. Electron + electron-vite + React 19 + Zustand + Tailwind 4 + `jsqr`.

## Layout

```
src/main/index.ts                  Window (1920x1080), IPC handler dialog:openCSV
src/preload/index.ts               Exposes window.electron and window.api.openCSV
src/renderer/src/
  main.tsx                         <AuthGuard><RoleRouter/></AuthGuard>
  stores/lucky-draw.ts             Zustand store: all draw logic
  lib/supabase.ts                  Supabase client (persistSession: true)
  hooks/
    useSession.ts                  Auth session listener
    useStaffRole.ts                Fetches { role, full_name } from public.staff
  components/
    AuthGuard.tsx, LoginPage.tsx   Email/password login gate
    RoleRouter.tsx                 Routes 'guard' -> GatePage, 'admin' -> LuckyDrawBoard (with toggle)
    EventLoader.tsx                Operator panel (bottom-right): category, event, prize, mode, START
    LuckyDraw/theme-02/            Stage board (index.tsx, SlotReel.tsx, style.css)
    Gate/
      GatePage.tsx                 Guard check-in screen (event selector, QR scanner, search, confirm card)
      QrScanner.tsx                Camera stream + jsQR decoder with non-HTTPS fallback
    DataManager.tsx                Legacy draw-controls panel (unused)
resources/mockup-data/             Sample CSVs (legacy)
```

Alias `@renderer` maps to `src/renderer/src`. The Vite dev server listens on `0.0.0.0:5173` (`host: true` in `electron.vite.config.ts`).

## Role Routing (`RoleRouter.tsx`)

After signing in, `useStaffRole` queries `public.staff` for the user's `user_id`:
- **No row or `active = false`:** Renders a "No access" screen with Sign out.
- **`role === 'guard'`:** Renders only `GatePage`. Guards cannot access the stage draw board.
- **`role === 'admin'`:** Renders `LuckyDrawBoard` + `EventLoader`, plus floating top-left **Open Gate** and **Sign out** buttons so admins can switch between the draw board and the Gate screen.

## Gate Screen (`Gate/GatePage.tsx` & `QrScanner.tsx`)

1. **Select Category & Event:** Required before scanning or searching.
2. **QR Scan (`method = 'qr'`):**
   - `QrScanner` opens the environment camera via `navigator.mediaDevices.getUserMedia` and decodes frames every 150 ms with `jsQR` (ignoring duplicate reads for 4 seconds, and pausing while a guest confirmation card is open).
   - Extracts the UUID from `${SITE_URL}/api/checkin?r=<uuid>` (or accepts a raw UUID) and calls `supabase.rpc('lookup_registration', { p_registration_id })`.
   - **LAN / HTTP safety:** Browsers disable `navigator.mediaDevices` on insecure origins like `http://192.168.x.x:5173`. `QrScanner` checks `navigator.mediaDevices?.getUserMedia` first and displays a clear notice instead of crashing, keeping the search workflow usable.
3. **Multi-Column Search (`method = 'manual'`):**
   - Debounced (300 ms) call to `supabase.rpc('search_registrations', { p_event_id, p_query })`.
   - Matches every space-separated word across customer name, email, phone, ticket code, and status.
4. **Explicit Confirmation:**
   - Scanning a pass or clicking **Select** on a search result opens a confirmation card showing Name, Ticket, Email, Phone, Event, and current Status.
   - Blocks confirmation if the pass belongs to a different event or is already checked in (displaying when, by whom, and via which method it was checked in).
   - Clicking **Confirm check-in** calls `supabase.rpc('confirm_checkin', { p_registration_id, p_method })`, which atomically updates `event_registrations` and logs the attempt in `checkin_logs`.

## Draw Logic (`useDrawStore`)

- `fetchEventData(eventId)`: loads `prize_pools` and checked-in `event_registrations` (`status = replied_scanned`) with customer names.
- `startDraw`: validates prize and quota, picks a random eligible participant (`prizeId == null`), sets `isSpinning`, calls `markAsDrawn` (DB write first with `.is('prize_pool_id', null)`), then animates.
- Modes: `auto` (reels stop sequentially at `1000 + index * 800` ms), `manual` (`Space` stops the next reel via `handleManualStop`), `instant` (immediate reveal + fireworks).
- **Spoiler protection:** Because the winner is saved to Supabase before the reels finish spinning, `LuckyDrawBoard` hides `winnerId` from the winners list and remaining counter until `isSpinning` becomes `false`.

## Keyboard Shortcuts (Stage Board)

| Key | Action |
| --- | --- |
| `Space` | Stop next reel (manual mode) |
| `W` | Toggle winners panel |
| `F12` | DevTools in dev (electron-toolkit) |

Keys are ignored while a `select`, `input`, or `textarea` has focus.
