---
name: component-convention
description: Enforce strict React/Next.js component formatting, pre-code component splitting with a strict 3-level useStyle depth limit, 3-space indentation, import spacing, snake_case style keys, Triad pattern (index.tsx, use-logic.ts, use-style.ts), strict separation of variant themes vs raw useStyle, and Tailwind v4 @theme token lookup. Use whenever generating, refactoring, or styling any UI component, layout, or page.
---
# Component Convention

## Summary

This skill enforces the exact line-by-line, space-by-space component architecture, mandatory pre-code component decomposition (represented via `useStyle` attributes with a strict 3-level depth limit), naming conventions, import ordering, JSX prop formatting, separation of `themes` (variants) vs `useStyle` (raw styles), and Tailwind v4 `@theme` token priority required for all UI components, layouts, and pages.

## When to Use

- Creating any new React/Next.js component, layout, or page.
- Refactoring existing UI code to match the project coding standard.
- Writing or modifying `index.tsx`, `use-logic.ts`, `use-style.ts`, `constants.ts`, or `style.module.css`.
- Selecting Tailwind CSS classes and verifying them against `@theme` tokens.

## Steps

### 1. Pre-Code Component Splitting & `useStyle` 3-Level Depth Rule (CRITICAL — DO THIS FIRST)

Before writing any code or creating any files, you **MUST** carefully analyze the UI and split the component into smaller, logical, maintainable, and scalable pieces. This step is the foundation of the entire convention and must be done with extreme care so it does not break the component structure:

- **Representing Splits in `useStyle`:** Every logical piece of a component (`index.tsx`) is represented as a semantic group in `useStyle` (e.g., `const { root, mobile, sidebar, fixed_header, main_content } = useStyle;`).
- **Strict 3-Level Depth Limit on `useStyle`:** Attributes in `useStyle` are **strictly limited to a maximum of 3 levels deep** (`useStyle.<level_1>.<level_2>.<level_3>`). Never create a 4th nesting level (e.g., `sidebar.header.logo.wrapper` is **FORBIDDEN**).
- **How to Split & Flatten to Respect the 3-Level Limit:**
   1. **Promote Logical Sub-Pieces to Level 2:** Even if an element is visually inside another element in the DOM, promote it to a sibling key at Level 2 so its children stay at Level 3.
      - *Correct (3 levels):* `sidebar.header.wrapper` and `sidebar.logo.wrapper` / `sidebar.logo.text`
      - *Forbidden (4 levels):* `sidebar.header.logo.wrapper`
   2. **Flatten Leaf Elements with `snake_case` at Level 3:** When a Level 2 group has multiple sub-elements, combine the element name with `snake_case` at Level 3 instead of nesting a 4th level.
      - *Correct (3 levels):* `fixed_header.tool.wrapper`, `fixed_header.tool.notify_wrapper`, `fixed_header.tool.notify_dot`, `fixed_header.tool.account_wrapper`, `fixed_header.tool.account_image`
      - *Forbidden (4 levels):* `fixed_header.tool.notify.wrapper`
   3. **Use `tv` Slots for Variant Sub-Elements:** When a Level 3 item uses `tailwind-variants` slots (defined in `themes`), assign the `tv` reference at Level 3 (`sidebar.navigation.items: themes.navigation_items`) and destructure the slots in `index.tsx` (`const { wrapper, icon } = sidebar.navigation.items({ active: item.active });`).
   4. **Extract Sub-Components When Needed:** If a UI section is too large, stateful, or complex to fit cleanly into 3 levels of `useStyle` without becoming crowded, split it out into its own dedicated child Component Triad directory.

### 2. File Structure (The Component Triad)

Organize every component directory with these files:

- `index.tsx`: Pure declarative JSX view layer built around the split `useStyle` pieces.
- `use-logic.ts`: State, hooks, translations, and event handlers.
- `use-style.ts`: `tailwind-variants` (`tv`), `cx`, and structured style objects (max 3 levels deep).
- `constants.ts`: Optional static arrays, navigation items, or configuration constants.
- `style.module.css`: Optional CSS module. **ONLY** create and use `style.module.css` when standard Tailwind utilities cannot achieve the layout (such as `grid-template-areas`) or when complex responsive `@media` overrides are needed.

### 3. Global Formatting Rules (Line-by-Line & Space-by-Space)

Follow these formatting rules in every file without exception:

- **Indentation:** Strictly **3 spaces** per indentation level in `.tsx`, `.ts`, and `.css` files. Never use 2 spaces, 4 spaces, or tabs.
- **Quotes:** Use single quotes (`'`) for all TypeScript/JavaScript strings, imports, and CSS `grid-template-areas`. Use double quotes (`"`) for standard JSX string attributes (`type="text"`, `alt="Profile"`, `role="main"`). Use backticks (`` ` ``) for template literals when appropriate.
- **Semicolons & Commas:** Always end statements with a semicolon (`;`). Always use trailing commas in multi-line objects, arrays, and function arguments.
- **Tailwind Important Modifier:** Use the Tailwind v4 trailing bang syntax (e.g., `text-14!`, `size-7!`) rather than a leading bang.

### 4. Strict Import Order & Blank Line Spacing

Group imports in the exact order below, separating distinct groups with **1 blank line**, and leaving **1 blank line** after the last import before the first declaration:

1. **Directives** (e.g., `'use client';`) followed by 1 blank line.
2. **External Framework & 3rd-Party Packages** (e.g., `next/image`, `react`, `lucide-react`, `tailwind-variants`).
3. **Internal Alias Imports** (e.g., `@admin-web/assets/...`, `@admin-web/locale`) separated by 1 blank line when mixing with assets/local files.
4. **Local Relative Imports** in alphabetical/logical order (`./constants`, `./use-logic`, `./use-style`, `./style.module.css`).

Example (`index.tsx`):

```tsx
'use client';

import Image from 'next/image';
import { Menu, X, Search, Bell } from 'lucide-react';

import defaultAvatar from '@admin-web/assets/svg/default-avatar.svg';

import { navItems } from './constants';
import { useLogic } from './use-logic';
import { useStyle } from './use-style';

export const LayoutAdmin: Router.Layout = (properties) => {
```

### 5. View Layer Rules (`index.tsx`)

- **Props Parameter:** Always name the component props parameter `properties` (never `props` or `propeties`), and destructure it on the first line inside the component:

```tsx
export const LayoutAdmin: Router.Layout = (properties) => {
   const { children } = properties;
   const { params, func } = useLogic();
   const { root, mobile, sidebar, fixed_header, main_content } = useStyle;
```

- **Top-of-Component Destructuring:** Immediately after destructuring `properties` (if present), destructure `useLogic()` and the top-level split pieces from `useStyle`, followed by **1 blank line** before `return (`.
- **Note on `useStyle`:** `useStyle` is an exported object, NOT a hook function. Destructure it directly (`const { ... } = useStyle;`), never call `useStyle()`.
- **JSX Attribute Formatting:**
   - **Single attribute:** Keep on the same line as the opening tag (e.g., `<div className={root.wrapper}>`).
   - **2 or more attributes:** Place each attribute on its own line indented by 3 spaces, and place the closing `>` or `/>` on its own line aligned with the opening `<`:

```tsx
<button
   className={mobile.close_menu}
   onClick={() => func.setIsSidebarOpen(false)}
>
   <X size={20} />
</button>
```

```tsx
<div
   className={fixed_header.tool.divider}
   aria-hidden="true"
/>
```

### 6. Logic Layer Rules (`use-logic.ts`)

- Export a named function `export function useLogic() { ... }`.
- Place all hooks (`useState`, `useTranslate`, etc.) at the top of `useLogic`, followed by **1 blank line** before the `return` statement.
- Return an object containing `params` (for state/values) and `func` (for functions/handlers/translations):

```ts
import { useTranslate } from '@admin-web/locale';
import { useState } from 'react';

export function useLogic() {
   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
   const { translate } = useTranslate('layouts.admin');

   return {
      params: {
         isSidebarOpen,
      },
      func: {
         translate,
         setIsSidebarOpen,
      },
   };
}
```

- **Omit Empty Groups:** If `params` has no values, omit `params` from the returned object (`return { func: { ... } };`). If `func` has no values, omit `func` (`return { params: { ... } };`). If neither exists, do not return empty objects.

### 7. Style Layer Rules (`use-style.ts` & `style.module.css`)

- **Check `@theme` First:** Before writing any Tailwind utility class, ALWAYS inspect the `@theme` definition in Step 8 first. Use `@theme` tokens (`p-primary`, `gap-primary`, `text-14`, `text-20`, `bg-neutral-50`, `text-neutral-950`, `border-utility-200`, `bg-error-600`, etc.) whenever a matching token exists. Only use standard Tailwind classes when the required value is not covered by `@theme`.
- **Enforce the 3-Level Depth Limit:** Every key path inside `export const useStyle` must be **2 or 3 levels deep** (e.g., `root.wrapper` or `fixed_header.search.input`). Never exceed 3 levels of object nesting inside `useStyle`.
- **Strict Separation Between `themes` and `useStyle`:**
   - **`const themes = { ... }` (Variant Styles Only):** `themes` is strictly where styles with variants (`tv({...})`) stay. All `base`, `slots`, `variants`, and `defaultVariants` definitions must be declared inside `const themes` at the top of `use-style.ts` using `snake_case` keys (e.g., `sidebar_panel`, `navigation_items`). Never write raw inline variant definitions directly inside `useStyle`. (If a component has no variants at all, omit `const themes`).
   - **`export const useStyle = { ... }` (Raw Styles & Inherited Variants Only):** `useStyle` is strictly where raw styles (plain strings, template literals, or `cx(...)` merges) stay, separated by **1 blank line** below `themes`.
   - **How `useStyle` Uses Variants from `themes`:** If an element inside `useStyle` needs variants, it MUST reference or inherit the style from `themes` in one of two ways:
      1. **Direct Assignment** (when no extra CSS module or base class merge is needed):
         ```ts
         items: themes.navigation_items,
         ```
      2. **Inherited `tv` Composition** (when combining a `themes` definition with `style.module.css` or additional base classes):
         ```ts
         wrapper: tv({
            base: [themes.sidebar_panel.base, css.sidebar_wrapper],
            variants: themes.sidebar_panel.variants,
            defaultVariants: themes.sidebar_panel.defaultVariants,
         }),
         ```
- **Naming Convention in `useStyle`:**
   - Use `snake_case` for all section and element keys (`root`, `sidebar`, `fixed_header`, `main_content`, `mobile`, `open_menu`, `close_menu`, `notify_wrapper`, `notify_dot`, `account_wrapper`, `account_image`).
   - Always name the outer container key of a block `wrapper` (`root.wrapper`, `sidebar.wrapper`, `sidebar.header.wrapper`, `sidebar.logo.wrapper`, `sidebar.navigation.wrapper`, `fixed_header.wrapper`, `fixed_header.search.wrapper`, `fixed_header.tool.wrapper`, `main_content.wrapper`).
   - Use `camelCase` for `tv` variant names (`isOpen`, `active`, `defaultVariants`).
- **Merging CSS Modules on Raw Styles:** When `style.module.css` is needed on a non-variant style, import it as `import css from './style.module.css';` (separated by 1 blank line after external imports) and merge via `cx('...', css.root_wrapper)`.
- **`style.module.css` Formatting:** Use `snake_case` class names matching the `useStyle` block (`root_wrapper`, `sidebar_wrapper`, `fixed_header_wrapper`, `main_content_wrapper`), 3-space indentation, and **1 blank line** between every CSS rule block.

### 8. Tailwind v4 `@theme` Reference (Check First)

Always check this `@theme` specification first before deciding whether to use an external/default Tailwind utility:

```css
@import 'tailwindcss';

@theme {
   --spacing-primary: 1rem;
   --spacing-secondary: 1.5rem;

   --color-neutral-50: #ffffff;
   --color-neutral-100: #f5f5f5;
   --color-neutral-200: #e5e5e5;
   --color-neutral-300: #d4d4d4;
   --color-neutral-400: #a1a1a1;
   --color-neutral-500: #737373;
   --color-neutral-600: #525252;
   --color-neutral-700: #404040;
   --color-neutral-800: #262626;
   --color-neutral-900: #171717;
   --color-neutral-950: #000000;

   --color-success-50: #f0fdf4;
   --color-success-100: #dcfce7;
   --color-success-200: #b9f8cf;
   --color-success-300: #7bf1a8;
   --color-success-400: #05df72;
   --color-success-500: #00c950;
   --color-success-600: #00a63e;
   --color-success-700: #008236;
   --color-success-800: #016630;
   --color-success-900: #0d542b;
   --color-success-950: #032e15;

   --color-warning-50: #fefce8;
   --color-warning-100: #fef9c2;
   --color-warning-200: #fff085;
   --color-warning-300: #ffdf20;
   --color-warning-400: #fdc700;
   --color-warning-500: #f0b100;
   --color-warning-600: #d08700;
   --color-warning-700: #a65f00;
   --color-warning-800: #894b00;
   --color-warning-900: #733e0a;
   --color-warning-950: #432004;

   --color-error-50: #fef2f2;
   --color-error-100: #ffe2e2;
   --color-error-200: #ffc9c9;
   --color-error-300: #ffa2a2;
   --color-error-400: #ff6467;
   --color-error-500: #fb2c36;
   --color-error-600: #e7000b;
   --color-error-700: #c10007;
   --color-error-800: #9f0712;
   --color-error-900: #82181a;
   --color-error-950: #460809;

   --color-info-50: #ecfeff;
   --color-info-100: #cefafe;
   --color-info-200: #a2f4fd;
   --color-info-300: #53eafd;
   --color-info-400: #00d3f3;
   --color-info-500: #00b8db;
   --color-info-600: #0092b8;
   --color-info-700: #007595;
   --color-info-800: #005f78;
   --color-info-900: #104e64;
   --color-info-950: #053345;

   --color-question-50: #f5f3ff;
   --color-question-100: #ede9fe;
   --color-question-200: #ddd6ff;
   --color-question-300: #c4b4ff;
   --color-question-400: #a684ff;
   --color-question-500: #8e51ff;
   --color-question-600: #7f22fe;
   --color-question-700: #7008e7;
   --color-question-800: #5d0ec0;
   --color-question-900: #4d179a;
   --color-question-950: #2f0d68;

   --color-primary-100: #e5ebff;
   --color-primary-200: #b2c4ff;
   --color-primary-300: #658aff;
   --color-primary-400: #194fff;
   --color-primary-500: #0036e5;
   --color-primary-600: #002ab2;
   --color-primary-700: #002393;
   --color-primary-800: #001f84;
   --color-primary-900: #001865;
   --color-primary-950: #001147;

   --color-secondary-100: #eaf6ff;
   --color-secondary-200: #b7e1ff;
   --color-secondary-300: #84ccff;
   --color-secondary-400: #51b7ff;
   --color-secondary-500: #1ea2ff;
   --color-secondary-600: #0089ea;
   --color-secondary-700: #0077cb;
   --color-secondary-800: #0065ad;
   --color-secondary-900: #00538e;
   --color-secondary-950: #004170;

   --color-social-facebook: #3b579d;
   --color-social-google: #d72332;

   --color-utility-200: #e2e8f0;
   --color-utility-300: #cad5e2;

   --font-primary: var(--font-inter);
   --font-secondary: Arial;

   --text-8: 0.5rem;
   --text-10: 0.625rem;
   --text-11: 0.6875rem;
   --text-12: 0.75rem;
   --text-13: 0.8125rem;
   --text-14: 0.875rem;
   --text-15: 0.9375rem;
   --text-16: 1rem;
   --text-18: 1.125rem;
   --text-20: 1.25rem;
   --text-22: 1.375rem;
   --text-24: 1.5rem;
   --text-26: 1.625rem;
   --text-28: 1.75rem;
   --text-30: 1.875rem;
   --text-32: 2rem;
   --text-36: 2.25rem;
   --text-40: 2.5rem;
   --text-48: 3rem;
   --text-50: 3.125rem;
   --text-56: 3.5rem;
   --text-60: 3.75rem;
   --text-64: 4rem;
   --text-70: 4.375rem;
   --text-72: 4.5rem;

   --radius-primary: 0.5rem;
   --radius-secondary: 0.75rem;
}

body {
   font-family: var(--font-primary), system-ui, sans-serif;
}
```

### 9. Gold-Standard Reference Template

Match the exact spacing, indentation, 3-level `useStyle` decomposition, and structure of the reference files below:

#### `index.tsx`

```tsx
'use client';

import Image from 'next/image';
import { Menu, X, Search, Bell } from 'lucide-react';

import defaultAvatar from '@admin-web/assets/svg/default-avatar.svg';

import { navItems } from './constants';
import { useLogic } from './use-logic';
import { useStyle } from './use-style';

export const LayoutAdmin: Router.Layout = (properties) => {
   const { children } = properties;
   const { params, func } = useLogic();
   const { root, mobile, sidebar, fixed_header, main_content } = useStyle;

   return (
      <div className={root.wrapper}>
         <aside className={sidebar.wrapper({ isOpen: params.isSidebarOpen })}>
            <div className={sidebar.header.wrapper}>
               <div className={sidebar.logo.wrapper}>
                  <div className={sidebar.logo.text}>E</div> Event Tools
               </div>
               <button
                  className={mobile.close_menu}
                  onClick={() => func.setIsSidebarOpen(false)}
               >
                  <X size={20} />
               </button>
            </div>
            <nav className={sidebar.navigation.wrapper}>
               <div className={sidebar.navigation.title}>{func.translate('navigation.title')}</div>
               {navItems.map((item) => {
                  const { wrapper, icon } = sidebar.navigation.items({ active: item.active });
                  return (
                     <a
                        key={item.name}
                        href={item.href}
                        className={wrapper()}
                     >
                        <item.icon className={icon()} />
                        {func.translate(`navigation.items.${item.name}`)}
                     </a>
                  );
               })}
            </nav>
         </aside>
         {params.isSidebarOpen && (
            <div
               className={mobile.overlay}
               onClick={() => func.setIsSidebarOpen(false)}
            />
         )}
         <header className={fixed_header.wrapper}>
            <button
               className={mobile.open_menu}
               onClick={() => func.setIsSidebarOpen(true)}
            >
               <Menu size={28} />
            </button>
            <div className={fixed_header.search.wrapper}>
               <Search className={fixed_header.search.icon} />
               <input
                  type="text"
                  className={fixed_header.search.input}
                  placeholder={func.translate('fixed_header.search_placeholder')}
               />
            </div>
            <div className={fixed_header.tool.wrapper}>
               <button className={fixed_header.tool.notify_wrapper}>
                  <span className={fixed_header.tool.notify_dot} />
                  <Bell size={20} />
               </button>
               <div
                  className={fixed_header.tool.divider}
                  aria-hidden="true"
               />
               <button className={fixed_header.tool.account_wrapper}>
                  <Image
                     src={defaultAvatar}
                     className={fixed_header.tool.account_image}
                     alt="Profile"
                  />
               </button>
            </div>
         </header>
         <main
            className={main_content.wrapper}
            role="main"
         >
            {children}
         </main>
      </div>
   );
};
```

#### `use-logic.ts`

```ts
import { useTranslate } from '@admin-web/locale';
import { useState } from 'react';

export function useLogic() {
   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
   const { translate } = useTranslate('layouts.admin');

   return {
      params: {
         isSidebarOpen,
      },
      func: {
         translate,
         setIsSidebarOpen,
      },
   };
}
```

#### `use-style.ts`

```ts
import { tv, cx } from 'tailwind-variants';

import css from './style.module.css';

const themes = {
   sidebar_panel: tv({
      base: [
         'fixed inset-0 right-auto flex flex-col w-72 bg-neutral-50 border-r border-utility-200 z-30',
         'transform transition-transform duration-300 ease-in-out',
         'lg:static lg:translate-x-0',
      ],
      variants: {
         isOpen: {
            true: 'translate-x-0',
            false: '-translate-x-full',
         },
      },
      defaultVariants: {
         isOpen: false,
      },
   }),
   navigation_items: tv({
      slots: {
         wrapper: 'group flex items-center px-primary py-2 text-14! font-medium rounded-lg transition-colors',
         icon: 'mr-primary size-5',
      },
      variants: {
         active: {
            true: {
               wrapper: 'bg-utility-400',
            },
            false: {
               wrapper: 'text-neutral-600 hover:bg-utility-400 hover:text-neutral-900',
               icon: 'text-neutral-400 group-hover:text-neutral-600',
            },
         },
      },
      defaultVariants: {
         active: false,
      },
   }),
};

export const useStyle = {
   root: {
      wrapper: cx('grid h-screen text-neutral-950 bg-neutral-100 overflow-hidden', css.root_wrapper),
   },
   sidebar: {
      wrapper: tv({
         base: [themes.sidebar_panel.base, css.sidebar_wrapper],
         variants: themes.sidebar_panel.variants,
         defaultVariants: themes.sidebar_panel.defaultVariants,
      }),
      header: {
         wrapper: 'flex shrink-0 items-center justify-between px-6 h-16 border-b border-utility-200',
      },
      logo: {
         wrapper: 'flex items-center gap-primary text-neutral-950 text-20 font-bold',
         text: 'flex size-8 items-center justify-center text-neutral-50 bg-neutral-950 rounded-lg',
      },
      navigation: {
         wrapper: 'flex-1 p-primary gap-y-1 overflow-y-auto',
         title: 'mb-primary text-neutral-600 text-12 font-semibold uppercase',
         items: themes.navigation_items,
      },
   },
   fixed_header: {
      wrapper: cx(
         'sticky top-0 flex items-center justify-between px-primary w-full h-16 border-b border-utility-200 bg-neutral-50',
         css.fixed_header_wrapper,
      ),
      search: {
         wrapper: 'relative items-center w-full max-w-md lg:max-w-xs',
         icon: 'absolute mx-3 w-4 h-full text-neutral-950 pointer-events-none',
         input: 'py-2 pl-10 pr-3 w-full text-neutral-950 text-14! bg-slate-50 border border-utility-300 rounded-md placeholder:text-neutral-400',
      },
      tool: {
         wrapper: 'flex flex-1 items-center justify-end gap-primary',
         divider: 'hidden sm:block h-6 w-px bg-slate-200',
         notify_wrapper: `relative p-3 text-neutral-600 bg-neutral-50 rounded-full transition-colors hover:text-neutral-950 hover:bg-neutral-200`,
         notify_dot: 'absolute top-2 right-2 size-2 rounded-full bg-error-600',
         account_wrapper: 'flex items-center p-2 rounded-full hover:bg-neutral-200',
         account_image: 'size-7! object-cover',
      },
   },
   main_content: {
      wrapper: cx('flex-1 p-primary overflow-y-auto focus:outline-none', css.main_content_wrapper),
   },
   mobile: {
      overlay: 'fixed inset-0 bg-neutral-950/25 transition-opacity z-20 lg:hidden',
      open_menu: `mr-4 text-neutral-950 rounded-md hover:text-slate-700 lg:hidden`,
      close_menu: 'text-neutral-950 lg:hidden',
   },
};
```

#### `constants.ts`

```ts
import { LayoutDashboard, Users, Calendar, Gamepad2 } from 'lucide-react';

export const navItems = [
   { name: 'dashboard', icon: LayoutDashboard, href: '#', active: true },
   { name: 'company', icon: Calendar, href: '#', active: false },
   { name: 'event', icon: Calendar, href: '#', active: false },
   { name: 'game', icon: Gamepad2, href: '#', active: false },
   { name: 'account', icon: Users, href: '#', active: false },
];
```

#### `style.module.css`

```css
.root_wrapper {
   grid-template-areas:
      'sidebar fixed_header'
      'sidebar main_content';
   grid-template-rows: 4rem 1fr;
   grid-template-columns: 18rem 1fr;
}

.sidebar_wrapper {
   grid-area: sidebar;
}

.fixed_header_wrapper {
   grid-area: fixed_header;
}

.main_content_wrapper {
   grid-area: main_content;
}

@media (max-width: 1024px) {
   .root_wrapper {
      grid-template-areas:
         'fixed_header'
         'main_content';
      grid-template-rows: 4rem 1fr;
      grid-template-columns: 1fr;
   }
}
```

## Gotchas

- **Always split the component FIRST before writing code:** Carefully plan the `useStyle` top-level keys and sub-sections first so that the component is maintainable, scalable, and never violates the convention.
- **Never exceed 3 levels of depth in `useStyle`:** `useStyle.a.b.c` is the absolute maximum depth. Promote nested blocks to Level 2 (e.g., `sidebar.logo.wrapper` instead of `sidebar.header.logo.wrapper`), flatten leaf keys with `snake_case` at Level 3 (e.g., `fixed_header.tool.notify_wrapper`), or extract a child component Triad.
- **Never use 2-space or 4-space indentation:** Every file must use 3 spaces.
- **Never write raw variant logic inside `useStyle`:** All `tv({...})` variant definitions (`variants`, `slots`, `defaultVariants`) must live inside `const themes`, and `useStyle` must only hold raw styles or inherit/reference from `themes`.
- **Never write raw Tailwind strings in `index.tsx`:** All classes belong in `use-style.ts`.
- **Never return empty `params` or `func` objects from `useLogic()`:** Omit whichever key is empty.
- **Never create `style.module.css` unnecessarily:** Only create it when Tailwind utilities cannot express the layout or responsive rule directly.
- **Always check `@theme` tokens first:** Do not use standard Tailwind font sizes (`text-sm`, `text-lg`) or arbitrary colors/spacings when a `@theme` token (`text-14`, `p-primary`, `gap-primary`, `bg-neutral-50`) exists.