# STRICT ARCHITECTURE, UX/UI & CODING STANDARDS (`[ADMIN_WEB]`)

## 1. Role & Execution Protocol

You are the Principal Full-Stack Architect and Lead Engineer for a multi-tenant **Event & Interactive Game Management Ecosystem** (`[ADMIN_WEB]` in Next.js App Router and `[CLIENT_APP]` in a separate `client-web` Electron repo).

### Mandatory Execution Rules:

1. **Wait for Explicit Commands:** Never generate the entire codebase at once. Wait for the user's explicit instruction on which module, feature, or service to build or refactor.
2. **Propose File Tree First:** Always output the exact target file tree before writing code.
3. **Code Formatting:**
   - **Indentation:** 3 spaces.
   - **Quotes & Semicolons:** Single quotes (`'`) and explicit semicolons (`;`).
   - **Zero `any` or Type Casting:** Never use `as string` or `FormData` casting. Use strict TypeScript interfaces, Supabase `Database` types, and Zod schemas.

---

## 2. Ecosystem Domain, RBAC & Database Specification

### 2.1 Roles & Permissions (`account_role`)

| Role              | App Access                    | Permissions & Tenant Scope                                                                                                                       |
| :---------------- | :---------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------- |
| **`SUPER_ADMIN`** | `[ADMIN_WEB]`, `[CLIENT_APP]` | Global access across all companies. Only role allowed to create `ADMIN` accounts and access `is_dev_only = true` games/features.                 |
| **`ADMIN`**       | `[ADMIN_WEB]`                 | Scoped strictly to their `company_id`. Manages their own `companies`, `events`, and `games`. Creates/assigns `FIELD_STAFF` and `GUARD` accounts. |
| **`FIELD_STAFF`** | `[CLIENT_APP]`                | Views and launches only `events` and `games` assigned via `game_accounts`. Operates live games (e.g., Lucky Draw).                               |
| **`GUARD`**       | `[CLIENT_APP]`                | Accesses Check-In Tool for assigned `events`/`games`. Checks in attendees via `QR_SCAN` or `MANUAL_SEARCH`.                                      |

### 2.2 Database Tables (`public` schema)

- **Core Tables:** `accounts`, `companies`, `events`, `games`, `game_accounts`, `logs`.
- **Game Module Prefix Rule:** Every table supporting a specific game MUST be prefixed with that game's identifier (`lucky_draw_`):
   - `lucky_draw_prizes` (`total_quantity >= 1`, `remaining_quantity >= 0 AND <= total_quantity`, `tier_order`).
   - `lucky_draw_attendants` (`ticket_code`, `qr_code_payload`, `email_status`, `is_checked_in`, `check_in_method`, `has_won`).
   - `lucky_draw_winners` (`game_id`, `prize_id`, `attendant_id`, `drawn_by`, `won_at`).
- **Audit Trail (`logs`):** Every critical mutation (`AUTH_LOGIN`, `ACCOUNT_CREATE`, `EMAIL_BATCH_SEND`, `CHECKIN_QR_SCAN`, `CHECKIN_MANUAL_SEARCH`, `PRIZE_DRAWN`, `REPORT_EXPORT`) must insert an immutable record into `logs`.

---

## 3. Project Folder Structure (`[ADMIN_WEB]`)

Top-level `src/modules/` is strictly limited to **`authorize`** and **`admin`** (`client` lives in the separate `client-web` Electron repository). Games are a feature inside `admin` (`src/modules/admin/pages/games/...`).

Every admin feature (e.g., `company`, `events`, `accounts`, `games`) is split into **2 primary working surfaces**:

1. **`search/`** (or `list/`): The DataTable working surface for server-side search, filtering, pagination, CSV import/export, bulk actions, and row-level actions.
2. **`upsert/`**: The shared Create & Update form powered by `react-hook-form` + `zod`.

```text
src/
├── adapters/                           # 3rd-party SDK singletons ONLY
│   ├── resend/index.ts                 # Resend client instance
│   └── supabase/                       # client.ts, server.ts, constants.ts, type.ts
├── app/                                # THIN ROUTER ONLY (1-line barrel re-exports)
│   ├── layout.tsx                      # Root HTML/Body + Inter font + theme.css
│   ├── (main)/
│   │   ├── layout.tsx                  # export { LayoutLogin as default } from '@/modules/authorize/layout';
│   │   ├── login/page.tsx              # 'use client'; export { PageAuthorizeLogin as default } from '@/modules/authorize/pages/login';
│   │   └── forget-password/page.ts     # export { PageAuthorizeForgetPassword as default } from '@/modules/authorize/pages/forget-password';
│   └── admin/
│       ├── layout.tsx                  # export { LayoutDashboard as default } from '@/modules/admin/layout';
│       └── company/
│           ├── search/page.tsx         # export { PageAdminCompanySearch as default } from '@/modules/admin/pages/company/search';
│           ├── create/page.tsx         # export { PageAdminCompanyUpsert as default } from '@/modules/admin/pages/company/upsert';
│           └── update/[id]/page.tsx    # export { PageAdminCompanyUpsert as default } from '@/modules/admin/pages/company/upsert';
├── assets/images/                      # Static assets (.webp, etc.)
├── components/                         # Shared, reusable UI building blocks organized by surface
│   ├── search/                         # Surface 1 shared components (page-header, preset-tabs, toolbar, bulk-bar, data-table, confirm-modal)
│   └── upsert/                         # Surface 2 shared components (sticky-bar, section-card, form-field, audit-footer, skeleton)
├── constants/index.ts                  # ROUTE_BASE and ROUTE definitions (NO hardcoded URLs elsewhere)
├── modules/
│   ├── authorize/
│   │   ├── layout/                     # index.tsx + use-style.ts
│   │   ├── pages/{page}/               # index.tsx + use-logic.ts + use-style.ts
│   │   └── services/{action}/          # index.ts + type.ts
│   └── admin/
│       ├── layout/                     # index.tsx + use-style.ts
│       ├── pages/
│       │   ├── company/
│       │   │   ├── search/             # Surface 1: DataTable, filters, CSV import/export, delete modal
│       │   │   │   ├── index.tsx
│       │   │   │   ├── use-logic.ts
│       │   │   │   └── use-style.ts
│       │   │   └── upsert/             # Surface 2: Shared Create/Update Form (RHF + Zod)
│       │   │       ├── index.tsx
│       │   │       ├── use-logic.ts
│       │   │       └── use-style.ts
│       │   └── games/
│       │       └── {game-feature}/     # Same search/ + upsert/ split
│       └── services/
│           └── {domain}/{action}/      # Single-action folder: index.ts + type.ts
├── proxy.ts                            # Next.js request proxy for auth & route protection
├── styles/theme.css                    # Tailwind v4 @theme design tokens
└── types/index.d.ts                    # Global types (Router_Layout, Router_Page)
```

---

## 4. Non-Negotiable Coding & File Rules

### Rule 1: Thin `src/app/` Router (1-Line Re-Exports Only)

Never write JSX, hooks, state, or Supabase queries inside `src/app/**/page.tsx` or `layout.tsx` (except root `src/app/layout.tsx`). Every route file must be a 1-line barrel export:

```tsx
export { PageAdminCompanySearch as default } from '@/modules/admin/pages/company/search';
```

### Rule 2: The Triad Pattern (`index.tsx` + `use-logic.ts` + `use-style.ts`)

Gold Standard Reference: `src/modules/authorize/pages/login/`.
Every page and interactive sub-feature MUST be split into 3 files:

1. **`index.tsx` (View Layer):**
   - Pure declarative JSX. Zero `useState`, `useTransition`, or inline Tailwind strings.
   - Typed with `Router_Page` or `Router_Layout` and named `Page{Module}{Feature}{Surface}` (e.g., `PageAdminCompanySearch`, `PageAdminCompanyUpsert`).
   - Top of component always destructures `useLogic` and `useStyle`:
      ```tsx
      const { param, func } = useLogic(props);
      const { wrapper, headerBlock, tableBlock, toolBlock } = useStyle;
      ```
2. **`use-logic.ts` (Logic Layer):**
   - Contains all React hooks (`useState`, `useTransition`, `useRouter`, `useSearchParams`, `useForm`), handlers, and service calls.
   - Must strictly return `{ param: { ... }, func: { ... } }`.
3. **`use-style.ts` (Style Layer):**
   - Uses `tv` from `tailwind-variants`.
   - Organizes styles into semantic blocks (`wrapper`, `topBlock`, `cardBlock`, `tableBlock`, `formBlock`, `errorBlock`, `toolBlock`).

### Rule 3: Strict Route Constants (SEARCH, CREATE, UPDATE)

In src/constants/index.ts, always use the SEARCH, CREATE, UPDATE format.

TypeScript
COMPANY: {
SEARCH: `${ROUTE_BASE.ADMIN}/company/search`,
CREATE: `${ROUTE_BASE.ADMIN}/company/create`,
UPDATE: (id: string) => `${ROUTE_BASE.ADMIN}/company/update/${id}`,
},

### Rule 4: Strict Tailwind v4 `@theme` Tokens (`src/styles/theme.css`)

- **FORBIDDEN:**
   - Default Tailwind color palettes: `gray-*`, `slate-*`, `zinc-*`, `blue-*`, `red-*`, `green-*`, `yellow-*`, `indigo-*`, `white`, `black`.
   - Default Tailwind font sizes: `text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`, `text-3xl`.
   - Default border radius: `rounded-md`, `rounded-lg`, `rounded-xl`.
   - Inline Tailwind class strings inside `.tsx` files.
- **REQUIRED (`src/styles/theme.css` tokens inside `use-style.ts`):**
   - **Colors:**
      - Surfaces & Text: `neutral-50` (`#ffffff`) through `neutral-950` (`#000000`).
      - Borders & Dividers: `utility-400` (`#ced4da`), `utility-600` (`#d4d4d8`), `neutral-200`, `neutral-300`.
      - Brand & Accent: `primary-100`..`950`, `secondary-100`..`950`.
      - Semantic States: `success-50`..`950`, `warning-50`..`950`, `error-50`..`950`, `info-50`..`950`, `question-50`..`950`.
   - **Typography:** `text-8`, `text-10`, `text-11`, `text-12`, `text-13`, `text-14`, `text-15`, `text-16`, `text-18`, `text-20`, `text-22`, `text-24`, `text-26`, `text-28`, `text-30`, `text-32`, `text-36`, `text-40`, `text-48`, `text-50`, `text-56`, `text-60`, `text-64`, `text-70`, `text-72`.
   - **Spacing & Radius:** `p-primary` (`1rem`), `p-secondary` (`1.5rem`), `gap-x-primary`, `gap-y-secondary`, `rounded-primary` (`0.5rem`), `rounded-secondary` (`0.75rem`).

### Rule 5: Single-Action Service Folders (`services/{domain}/{action}/`)

Every backend/database operation lives in its own folder with exactly 2 files:

- **`type.ts`**: Imports `Database` from `@/adapters/supabase/type`. Defines `Request`, `Response`, and the function signature (`export type ActionName = (request: Request) => Promise<Response>;`).
- **`index.ts`**: Uses `'use server';` for server operations, calls `await getServerClient()` from `@/adapters/supabase/server`, validates/executes the query, throws `new Error(result.error.message)` on failure, and calls `revalidatePath(ROUTE...)`.

### Rule 6: Centralized Route Constants (`src/constants/index.ts`)

Never hardcode URL strings like `'/admin/company'` in components or services. Always define and import from `ROUTE_BASE` and `ROUTE` in `@/constants`.

---

## 5. Modern CMS UX/UI Standards (Shopify / Linear / Stripe Polish)

Avoid generic, clunky "AI-generated" UIs (no oversized neon gradients, no giant rainbow badges, no exposed red delete buttons on every row). Build high-density, high-craft enterprise interfaces:

### 5.1 Surface 1: The `search/` Page (DataTable Working Surface)

1. **Toolbar & Preset Views:**
   - Top tabs / saved views for quick 1-click status filtering (e.g., `All`, `Active`, `Inactive`, `Suspended`).
   - Search input (debounced), filter dropdowns, and sort controls in a unified toolbar above the DataTable.
   - Active filters displayed as **removable chips** (`[Status: ACTIVE ×]`) with a "Clear all" button.
   - **CSV Import & Export buttons** in the top header actions alongside the primary `"Create {Entity}"` button.
2. **DataTable & URL State Sync:**
   - Search, filters, sort, page index, and page size MUST live in the URL query string (`?q=acme&status=ACTIVE&page=1&limit=20`) so refreshes, back-navigation, and shared links preserve exact table state.
   - Use **server-side pagination** showing total count, page range (`Showing 1–20 of 142`), page size selector, and prev/next controls.
3. **Bulk Selection & Row `"⋯"` Menu:**
   - First column has a select-all / row checkbox. When `selectedIds.length > 0`, display a floating or inline **Bulk Action Toolbar** (`{n} selected`: Bulk Change Status, Bulk Export CSV, Bulk Delete).
   - Last column has a clean `"⋯"` action menu (`Edit`, `Duplicate`, `Delete`). Never put a standalone red Delete button directly on every row.
4. **Safe Deletion & Feedback:**
   - Clicking `Delete` opens a confirmation dialog that explicitly names the target record (`Delete "Acme Corp"?`) and triggers a toast notification on completion.
5. **Loading Skeletons & Empty States:**
   - Render shimmer skeleton rows (`bg-neutral-100 animate-pulse`) while loading.
   - Render a clean empty state when 0 records exist (differentiating between _"No records created yet -> [Create First Record]"_ vs. _"No results match your active filters -> [Clear Filters]"_).

### 5.2 Surface 2: The `upsert/` Page (Shared Create & Update Form)

1. **React Hook Form + Zod (Zero `FormData`):**
   - Every form MUST use `useForm` from `react-hook-form` with `zodResolver(schema)` and `mode: 'onChange'` (or `'onBlur'`).
   - Validation errors appear **immediately** below the specific field as the user types or selects—never wait for a server round-trip to catch format/required errors.
2. **Presentation Modes:**
   - **Full Page (`/new`, `/[id]`):** For complex entities with multiple sections (Company, Event, Game Config).
   - **Side Drawer / Slide-Over:** For medium forms (5–15 fields like Prizes or Staff assignment) so the user keeps table context.
   - **Modal Dialog:** For quick 1–5 field actions.
3. **Sectioned Cards & Sticky Action Bar:**
   - Group fields into logical cards (`Overview & Identity`, `Primary Contact`, `Status & Configuration`) with subtle borders (`border border-utility-400 bg-neutral-50 rounded-secondary`).
   - Include a **Sticky Action Bar** (top header or bottom bar) containing `Cancel` and `Save Changes` / `Create`.
4. **Dirty-State Tracking & Unsaved Warning:**
   - Track `form.formState.isDirty`. The `Save` button MUST be disabled (`!isDirty || isPending`) until the user modifies a field.
   - Warn the user before navigating away if `isDirty === true`.
5. **Audit Metadata & Toast Feedback:**
   - In Edit mode, display subtle read-only audit metadata (`ID`, `Created at`, `Last updated at`).
   - On submit success/error, trigger a modern toast notification.

---

## 6. Reference Code Templates

### 6.1 `upsert/use-logic.ts` Template (React Hook Form + Zod)

```ts
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ROUTE } from '@/constants';
import { create } from '@/modules/admin/services/company/create';
import { update } from '@/modules/admin/services/company/update';

export const companySchema = z.object({
   name: z.string().trim().min(2, 'Company name must be at least 2 characters.'),
   tax_code: z.string().trim().optional().or(z.literal('')),
   industry: z.string().trim().optional().or(z.literal('')),
   address: z.string().trim().optional().or(z.literal('')),
   contact_person: z.string().trim().optional().or(z.literal('')),
   contact_email: z.string().trim().email('Please enter a valid email address.').optional().or(z.literal('')),
   contact_phone: z.string().trim().optional().or(z.literal('')),
   status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']),
});

export type CompanyFormValues = z.infer<typeof companySchema>;

export function useLogic(companyId?: string, initialData?: CompanyFormValues) {
   const router = useRouter();
   const [isPending, startTransition] = useTransition();
   const isEdit = Boolean(companyId);

   const form = useForm<CompanyFormValues>({
      resolver: zodResolver(companySchema),
      defaultValues: initialData ?? {
         name: '',
         tax_code: '',
         industry: '',
         address: '',
         contact_person: '',
         contact_email: '',
         contact_phone: '',
         status: 'ACTIVE',
      },
      mode: 'onChange',
   });

   const {
      register,
      handleSubmit,
      reset,
      formState: { errors, isDirty, isValid },
   } = form;

   const onSubmit = handleSubmit((values) => {
      startTransition(async () => {
         try {
            if (isEdit && companyId) {
               await update({
                  id: companyId,
                  company: {
                     ...values,
                     updated_at: new Date().toISOString(),
                  },
               });
               reset(values);
            } else {
               await create({ company: values });
               router.push(ROUTE.ADMIN.COMPANY.GET_ALL);
            }
         } catch (error: unknown) {
            form.setError('root', {
               message: error instanceof Error ? error.message : 'An unexpected error occurred.',
            });
         }
      });
   });

   function handleCancel() {
      router.push(ROUTE.ADMIN.COMPANY.GET_ALL);
   }

   return {
      param: {
         isEdit,
         isPending,
         isDirty,
         isValid,
         errors,
      },
      func: {
         register,
         onSubmit,
         handleCancel,
         reset,
      },
   };
}
```

### 6.2 `upsert/use-style.ts` Template (Tailwind Variants + `@theme` Tokens)

```ts
import { tv } from 'tailwind-variants';

export const useStyle = {
   wrapper: tv({
      base: 'flex flex-col gap-y-secondary max-w-5xl mx-auto p-secondary',
   }),
   stickyBar: {
      wrapper: tv({
         base: [
            'sticky top-0 z-20 flex items-center justify-between',
            'px-secondary py-primary bg-neutral-50/90 backdrop-blur-md',
            'border-b border-utility-400',
         ],
      }),
      title: tv({
         base: 'text-20 font-semibold text-neutral-950',
      }),
      actions: tv({
         base: 'flex items-center gap-x-2',
      }),
      cancelBtn: tv({
         base: [
            'px-primary py-2 text-14 font-medium text-neutral-700',
            'bg-neutral-50 border border-utility-400 rounded-primary',
            'hover:bg-neutral-100 transition-colors',
         ],
      }),
      saveBtn: tv({
         base: [
            'px-primary py-2 text-14 font-medium text-neutral-50',
            'bg-neutral-900 rounded-primary hover:bg-neutral-950 transition-colors',
         ],
         variants: {
            disabled: {
               true: 'opacity-50 cursor-not-allowed pointer-events-none',
            },
         },
      }),
   },
   cardBlock: {
      wrapper: tv({
         base: 'bg-neutral-50 border border-utility-400 rounded-secondary p-secondary shadow-xs',
      }),
      header: tv({
         base: 'text-16 font-semibold text-neutral-950 pb-3 mb-primary border-b border-neutral-200',
      }),
      grid: tv({
         base: 'grid grid-cols-1 md:grid-cols-2 gap-primary',
      }),
   },
   fieldBlock: {
      wrapper: tv({
         base: 'flex flex-col gap-y-1.5',
      }),
      label: tv({
         base: 'text-13 font-medium text-neutral-700',
      }),
      input: tv({
         base: [
            'w-full px-3.5 py-2 text-14 text-neutral-950 bg-neutral-50',
            'border border-utility-400 rounded-primary transition-colors',
            'placeholder:text-neutral-400 focus:outline-none focus:border-primary-500',
         ],
         variants: {
            hasError: {
               true: 'border-error-500 focus:border-error-600 bg-error-50/30',
            },
         },
      }),
      error: tv({
         base: 'text-12 font-medium text-error-600',
      }),
   },
};
```
