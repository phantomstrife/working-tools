# UI & UX Design Guide for AI Agents

This document is the authoritative UI/UX specification for generating, refactoring, or extending interfaces in the `event-tools` monorepo. Any AI agent building or modifying UI MUST follow these rules so new screens look cohesive, intentional, and effortless to operate under live-event pressure.

---

## 1. Product Context & UX Personas

Each app serves a distinct physical environment. Design for the operator's real-world constraints:

| Surface | Persona & Environment | Primary UX Priority |
| --- | --- | --- |
| **Event Dashboard** (`event-dashboard`) | Back-office organizer at a laptop before/during the event. | **High information density, batch workflows, zero-ambiguity feedback**, fast filtering, non-blocking notifications, safe destructive actions. |
| **Gate Check-in** (`lucky-draw` → `GatePage`) | Security guard standing at the venue entrance (often on tablet/mobile or laptop in dim lighting, long queue of guests). | **One-handed / low-click speed, giant touch targets (min 44px), instant visual status (Green = Go, Amber = Warning, Red = Stop)**, zero page jumps. |
| **Lucky Draw Stage Board** (`lucky-draw` → `LuckyDrawBoard`) | Projected on a giant LED wall (1920×1080 or 1:2 vertical) in front of hundreds of attendees. | **Spectacle, 10-meter readability, high contrast, smooth 60fps animations, zero spoiler leaks**, unobtrusive floating operator controls. |
| **VDJ Show Control** (`virtualdj`) | Stage manager / VJ booth monitor in a dark control room. | **Glanceable big-number timecodes, high-contrast dark theme, zero layout shift** while ticking at 60fps. |

---

## 2. Visual System & Color Tokens (Tailwind v4)

All operational UIs (`event-dashboard` and `lucky-draw` operator/gate screens) use a **Dark Slate Console** aesthetic. Avoid mixed light/dark screens (note: `login/page.tsx` in the dashboard is legacy light mode and should be migrated to dark slate when touched).

### Surface Hierarchy
Build depth through layered slate tones and subtle 1px borders—never heavy drop shadows on dark backgrounds:
- **App Canvas (Background):** `bg-slate-950` or `bg-slate-900` (`text-slate-100`)
- **Primary Card / Panel / Table Container:** `bg-slate-800/80` or `bg-slate-800` with `border border-slate-700/80 rounded-xl`
- **Elevated / Floating / Modal Surface:** `bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl` with backdrop `bg-black/70 backdrop-blur-sm`
- **Recessed Input / Well / Table Header:** `bg-slate-900 border border-slate-700` (table header: `bg-slate-900/60`)
- **Interactive Row Hover:** `hover:bg-slate-700/40 transition-colors`

### Accent & Brand Colors
- **Event Dashboard Primary Accent:** Indigo (`bg-indigo-600 hover:bg-indigo-500 text-white`, focus ring `focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20`)
- **Lucky Draw & Gate Primary Accent:** Gold / Amber (`bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold`, focus ring `focus:border-yellow-500`)

### Semantic Status Tokens
Always pair background tint + border + text color + icon/dot so status is never communicated by color alone:

| Meaning | Badge / Banner Classes |
| --- | --- |
| **Neutral / Imported** | `bg-slate-700/70 text-slate-300 border border-slate-600` |
| **Info / Email Sent** | `bg-blue-950/70 text-blue-300 border border-blue-800` |
| **Success / Checked In (`replied_scanned`)** | `bg-emerald-950/70 text-emerald-300 border border-emerald-700` |
| **Winner / Prize Awarded** | `bg-yellow-950/60 text-yellow-300 border border-yellow-700` |
| **Danger / Duplicate / Wrong Event** | `bg-red-950/70 text-red-300 border border-red-800` |

---

## 3. Typography & Scannability

1. **Monospace for Machine & Lookup Data:** Always apply `font-mono tracking-wider` to **ticket codes**, **UUIDs**, **passwords**, and **timecodes/countdowns**. Ticket codes should stand out in `text-yellow-300` or `text-indigo-300`.
2. **Tabular Numbers for Counters:** Any live counter, stat card number, or countdown MUST use `tabular-nums` so digits never jitter horizontally when values change.
3. **Hierarchy:**
   - Page Title: `text-2xl md:text-3xl font-bold tracking-tight text-white`
   - Section / Card Title: `text-base font-semibold text-white`
   - Field Labels & Table Headers: `text-xs font-semibold uppercase tracking-wider text-slate-400`
   - Body / Table Cell: `text-sm text-slate-200` (secondary metadata: `text-xs text-slate-400`)

---

## 4. Component & Interaction Patterns (UX Rules for AI)

### 4.1 Replace Native Browser Dialogs (`alert`, `confirm`, `prompt`)
Existing code uses `alert()`, `confirm()`, and `prompt()`. When generating new features or upgrading existing views:
- **Never use `prompt()`** to create entities (like categories, events, or password resets). Use an inline popover or a clean modal form with proper validation and `autoFocus` on the first input.
- **Never use `alert()`** for routine success/error feedback. Use an inline status banner or a dismissible toast notification in the top-right corner (`fixed top-5 right-5 z-50`).
- **Use a confirmation modal** instead of `confirm()` for destructive actions (deleting a prize, resetting a password, or saving a mismatched ticket code length), clearly stating the consequence.

### 4.2 Forms, Inputs & Modals
- **Standard Input Class:**
  ```tsx
  className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
  ```
- **Read-only Fields:** Visually distinguish read-only inputs (`bg-slate-900/50 border-slate-800 text-slate-500 cursor-not-allowed`) and include `(read-only)` in the label.
- **Modal UX:**
  - Close on `Escape` key and backdrop click (unless a request is in flight).
  - Trap focus and `autoFocus` the primary input on open.
  - Disable the submit button while saving and show a spinner + action verb (`Saving...`, `Sending...`, `Checking in...`).

### 4.3 Tables & Bulk Operations (Event Dashboard)
- **Search & Filter Bar:** Whenever a table can hold >20 rows (customers, staff), include a client-side filter bar above the table (search by name/email/ticket + status filter pills: `All`, `Imported`, `Email Sent`, `Checked In`, `Winners`).
- **Sticky Contextual Bulk Bar:** When `selectedCustomers.length > 0`, show a clear selection count badge (`{n} selected`) with a "Clear selection" link alongside primary batch actions (`Send Pass Email`).
- **Empty & Loading States:**
  - Loading: use subtle pulsing skeleton rows (`animate-pulse bg-slate-800/60 h-12`) instead of plain `"Loading..."` text.
  - Empty: center an icon (`lucide-react`), a clear title (`No customers imported yet`), and a direct CTA button (`Import Customers CSV`).

### 4.4 Gate Check-in UX (`GatePage` & `QrScanner`)
Guards operate under time pressure. Every millisecond and extra tap matters:
1. **Persistent Event Selection:** Remember the last selected `categoryId` and `eventId` in `localStorage` so refreshing the page on a guard's phone does not force them to re-select the event.
2. **Unmistakable Confirmation Card:**
   - When a guest is scanned or selected from search, highlight the confirmation card prominently (`border-2`).
   - Color-code the card border and header immediately by eligibility:
     - **Ready to check in:** Emerald border (`border-emerald-500/80`), large full-width `Confirm check-in` button (`py-3 text-base font-bold`).
     - **Already checked in / Wrong event:** Red/Amber border (`border-red-500/80`), show **exact timestamp, guard name, and method (`qr` / `manual`)**, and disable the confirm button.
3. **Keyboard-First Speed:**
   - Allow pressing `Enter` to confirm check-in when a valid guest card is pending, and `Escape` to cancel/dismiss.
   - Include a quick "Clear (`×`)" button inside the search input and refocus the search box after a manual check-in completes.
4. **Camera Resilience:**
   - Keep the viewfinder framed with a clear target reticle.
   - When `navigator.mediaDevices` is unavailable (e.g., plain HTTP on a LAN IP), display a helpful fallback card inside the camera box explaining how to enable HTTPS or use the search panel right next to it—never crash the page.

### 4.5 Lucky Draw Stage Board vs. Operator Panel
1. **Strict Separation of Concerns:**
   - **Stage Board (`LuckyDrawBoard`):** Vietnamese copy, celebratory graphics, zero admin clutter. Never render debug text, raw errors, or database IDs on the stage canvas.
   - **Operator Panel (`EventLoader`):** English copy, compact floating panel (`fixed bottom-5 right-5 z-50`), collapsible/minimizable so it does not block the stage projection if run on a single screen.
2. **Global Hotkey Safety:** Stage hotkeys (`Space` to stop reel, `W` to toggle winners) MUST ignore keydowns when focus is inside `<input>`, `<select>`, or `<textarea>`.

---

## 5. Pre-Flight Checklist for AI UI Changes

Before finishing any UI task, verify:
- [ ] **No layout shifts:** Numbers use `tabular-nums`; long names/emails use `truncate` with `min-w-0` on flex children.
- [ ] **Disabled states:** Every async button disables itself while busy and shows progress text.
- [ ] **Contrast & legibility:** Text on dark backgrounds is at least `text-slate-300` for body and `text-slate-400` for secondary labels (avoid `text-slate-600` for readable text).
- [ ] **Icons:** Use `lucide-react` in `event-dashboard` (`w-4 h-4` inside buttons, `w-5 h-5` in headers). In `lucky-draw` (which does not install `lucide-react`), use clean inline SVGs or install `lucide-react` if requested.
- [ ] **Responsive behavior:** Gate Check-in and Dashboard grids collapse cleanly to 1 column on mobile (`grid-cols-1 lg:grid-cols-2`) so guards on phones get a stacked layout without horizontal scrolling.

