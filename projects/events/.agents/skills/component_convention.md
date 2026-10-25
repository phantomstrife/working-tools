---
name: component-convention
description: Enforce strict React/Next.js component formatting, 3-space indentation, import spacing, snake_case style keys, Triad pattern (index.tsx, use-logic.ts, use-style.ts), and Tailwind v4 @theme token lookup. Use whenever generating, refactoring, or styling any UI component, layout, or page.
---
# Component Convention

## Summary

This skill enforces the exact line-by-line, space-by-space component architecture, naming conventions, import ordering, JSX prop formatting, and Tailwind v4 `@theme` token priority required for all UI components, layouts, and pages.

## When to Use

- Creating any new React/Next.js component, layout, or page.
- Refactoring existing UI code to match the project coding standard.
- Writing or modifying `index.tsx`, `use-logic.ts`, `use-style.ts`, `constants.ts`, or `style.module.css`.
- Selecting Tailwind CSS classes and verifying them against `@theme` tokens.

## Steps

### 1. File Structure (The Component Triad)

Organize every component directory with these files:

- `index.tsx`: Pure declarative JSX view layer.
- `use-logic.ts`: State, hooks, translations, and event handlers.
- `use-style.ts`: `tailwind-variants` (`tv`), `cx`, and structured style objects.
- `constants.ts`: Optional static arrays, navigation items, or configuration constants.
- `style.module.css`: Optional CSS module. **ONLY** create and use `style.module.css` when standard Tailwind utilities cannot achieve the layout (such as `grid-template-areas`) or when complex responsive `@media` overrides are needed.

### 2. Global Formatting Rules (Line-by-Line & Space-by-Space)

Follow these formatting rules in every file without exception:

- **Indentation:** Strictly **3 spaces** per indentation level in `.tsx`, `.ts`, and `.css` files. Never use 2 spaces, 4 spaces, or tabs.
- **Quotes:** Use single quotes (`'`) for all TypeScript/JavaScript strings, imports, and CSS `grid-template-areas`. Use double quotes (`"`) for standard JSX string attributes (`type="text"`, `alt="Profile"`, `role="main"`). Use backticks (`` ` ``) for template literals.
- **Semicolons & Commas:** Always end statements with a semicolon (`;`). Always use trailing commas in multi-line objects, arrays, and function arguments.
- **Tailwind Important Modifier:** Use the Tailwind v4 trailing bang syntax (e.g., `text-14!`, `size-7!`) rather than a leading bang.

### 3. Strict Import Order & Blank Line Spacing

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

### 4. View Layer Rules (`index.tsx`)

- **Props Parameter:** Always name the component props parameter `properties` (never `props` or `propeties`), and destructure it on the first line inside the component:

```tsx
export const LayoutAdmin: Router.Layout = (properties) => {
   const { children } = properties;
   const { params, func } = useLogic();
   const { root, mobile, sidebar, fixed_header, main_content } = useStyle;
```

- **Top-of-Component Destructuring:** Immediately after destructuring `properties` (if present), destructure `useLogic()` and `useStyle`, followed by **1 blank line** before `return (`.
- **Note on `useStyle`:** `useStyle` is an exported object, NOT a hook function. Destructure it directly (`const { ... } = useStyle;`), never call `useStyle()`.
- **JSX Attribute Formatting:**
   - **Single attribute:** Keep on the same line as the opening tag (e.g., `<div className={root.wrapper}>`).
   - **2 or more attributes:** Place each attribute on its own line indented by 3 spaces, and place the closing `>` or `/>` on its own line aligned with the opening `<`:

```tsx
<button
   className={mobile.close_menu}
   onClick={() => func.setIsSidebarOpen(false)}
>
   <X size="{20}"/>
</button>
```

```tsx
<div
   className={fixed_header.tool.divider}
   aria-hidden="true"
/>
```

### 5. Logic Layer Rules (`use-logic.ts`)

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

### 6. Style Layer Rules (`use-style.ts` & `style.module.css`)

- **Check `@theme` First:** Before writing any Tailwind utility class, ALWAYS inspect the `@theme` definition in Step 7 first. Use `@theme` tokens (`p-primary`, `gap-primary`, `text-14`, `text-20`, `bg-neutral-50`, `text-neutral-950`, `border-utility-200`, `bg-error-600`, etc.) whenever a matching token exists. Only use standard Tailwind classes when the required value is not covered by `@theme`.
- **`themes` Definition:** Define reusable or variant-driven `tv({...})` configurations inside a local `const themes = { ... };` object at the top of `use-style.ts` using `snake_case` keys (e.g., `sidebar_panel`, `navigation_items`).
- **`useStyle` Export:** Export `export const useStyle = { ... };` below `themes` (separated by 1 blank line).
- **Naming Convention in `useStyle`:**
   - Use `snake_case` for all section and element keys (`root`, `sidebar`, `fixed_header`, `main_content`, `mobile`, `open_menu`, `close_menu`, `notify_wrapper`, `notify_dot`, `account_wrapper`, `account_image`).
   - Always name the outer container key of a block `wrapper` (`root.wrapper`, `sidebar.wrapper`, `sidebar.header.wrapper`, `sidebar.logo.wrapper`, `sidebar.navigation.wrapper`, `fixed_header.wrapper`, `fixed_header.search.wrapper`, `fixed_header.tool.wrapper`, `main_content.wrapper`).
   - Use `camelCase` for `tv` variant names (`isOpen`, `active`, `defaultVariants`).
- **Merging CSS Modules:** When `style.module.css` is needed, import it as `import css from './style.module.css';` and merge via `cx('...', css.root_wrapper)` or inside `tv({ base: [themes.sidebar_panel.base, css.sidebar_wrapper], ... })`.
- **`style.module.css` Formatting:** Use `snake_case` class names matching the `useStyle` block (`root_wrapper`, `sidebar_wrapper`, `fixed_header_wrapper`, `main_content_wrapper`), 3-space indentation, and **1 blank line** between every CSS rule block.

### 7. Tailwind v4 `@theme` Reference (Check First)

Always check this `@theme` specification first before deciding whether to use an external/default Tailwind utility:

```css
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
```

## Gotchas

- **Never use 2-space or 4-space indentation:** Every file must use 3 spaces.
- **Never write raw Tailwind strings in `index.tsx`:** All classes belong in `use-style.ts`.
- **Never return empty `params` or `func` objects from `useLogic()`:** Omit whichever key is empty.
- **Never create `style.module.css` unnecessarily:** Only create it when Tailwind utilities cannot express the layout or responsive rule directly.
- **Always check `@theme` tokens first:** Do not use standard Tailwind font sizes (`text-sm`, `text-lg`) or arbitrary colors/spacings when a `@theme` token (`text-14`, `p-primary`, `gap-primary`, `bg-neutral-50`) exists.