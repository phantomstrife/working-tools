import { tv } from 'tailwind-variants';

import css from './style.module.css';

export const useStyle = {
   expandedContainer: tv({
      base: 'fixed z-50 flex flex-col select-none',
      variants: {
         interacting: {
            true: 'select-none',
            false: '',
         },
      },
      defaultVariants: {
         interacting: false,
      },
   }),
   resizeHandle: tv({
      base: 'absolute touch-none',
      variants: {
         direction: {
            n: '-top-1 left-2 right-2 h-2 cursor-ns-resize z-20',
            s: '-bottom-1 left-2 right-2 h-2 cursor-ns-resize z-20',
            e: 'top-2 bottom-2 -right-1 w-2 cursor-ew-resize z-20',
            w: 'top-2 bottom-2 -left-1 w-2 cursor-ew-resize z-20',
            ne: '-top-1.5 -right-1.5 size-3.5 cursor-nesw-resize z-30',
            nw: '-top-1.5 -left-1.5 size-3.5 cursor-nwse-resize z-30',
            se: '-bottom-1.5 -right-1.5 size-3.5 cursor-nwse-resize z-30',
            sw: '-bottom-1.5 -left-1.5 size-3.5 cursor-nesw-resize z-30',
         },
      },
   }),
   operatorCard: tv({
      base: [
         'relative flex flex-col w-full min-h-0 overflow-hidden',
         'bg-neutral-900/95 border rounded-secondary text-neutral-100 shadow-2xl backdrop-blur-md transition-colors',
      ],
      variants: {
         active: {
            true: 'border-warning-500/80',
            false: 'border-neutral-700/80',
         },
      },
      defaultVariants: {
         active: false,
      },
   }),
   dragBar: tv({
      base: [
         'shrink-0 h-6 px-2 flex items-center justify-between gap-2',
         'border-b border-neutral-800/80 bg-neutral-950/45 touch-none transition-colors',
      ],
      variants: {
         dragging: {
            true: 'cursor-grabbing bg-neutral-800/70',
            false: 'cursor-grab hover:bg-neutral-800/45',
         },
      },
      defaultVariants: {
         dragging: false,
      },
   }),
   dragBarSpacer: tv({
      base: 'size-5 shrink-0',
   }),
   dragGripIcon: tv({
      base: 'text-neutral-500 shrink-0 pointer-events-none',
   }),
   resetBoxBtn: tv({
      base: [
         'size-5 shrink-0 flex items-center justify-center rounded-primary',
         'text-neutral-500 hover:text-neutral-100 hover:bg-neutral-800 transition-colors cursor-pointer',
      ],
   }),
   cardBody: tv({
      base: 'flex-1 min-h-0 overflow-y-auto overflow-x-hidden flex flex-col',
      variants: {
         layoutMode: {
            compact: 'p-2.5 gap-2',
            standard: 'p-3.5 gap-3',
            wide: 'px-3.5 py-2.5 gap-2.5 justify-between',
         },
         heightMode: {
            short: 'py-2 gap-2',
            regular: '',
         },
      },
      defaultVariants: {
         layoutMode: 'standard',
         heightMode: 'regular',
      },
   }),
   noticeBanner: tv({
      base: [
         'shrink-0 text-neutral-50! mb-2 flex items-start justify-between gap-2 rounded-primary border',
         'font-medium backdrop-blur-md cursor-pointer',
      ],
      variants: {
         kind: {
            error: 'bg-error-950/90 border-error-800 text-error-200',
            warning: 'bg-warning-950/90 border-warning-700 text-warning-200',
            info: 'bg-info-950/90 border-info-700 text-info-200',
         },
         compact: {
            true: 'px-2.5 py-1.5 text-11',
            false: 'px-3 py-2 text-12',
         },
      },
      defaultVariants: {
         compact: false,
      },
   }),
   noticeText: tv({
      base: 'min-w-0 break-words leading-snug',
   }),
   noticeCloseBtn: tv({
      base: 'text-current opacity-70 hover:opacity-100 font-bold leading-none cursor-pointer shrink-0',
   }),
   bodyGrid: tv({
      base: 'min-w-0',
      variants: {
         layoutMode: {
            compact: 'flex flex-col gap-2',
            standard: 'flex flex-col gap-3',
            wide: `${css.wide_body_grid} gap-3`,
         },
         heightMode: {
            short: 'gap-2',
            regular: '',
         },
      },
      defaultVariants: {
         layoutMode: 'standard',
         heightMode: 'regular',
      },
   }),
   fieldGroup: tv({
      base: 'flex flex-col min-w-0',
      variants: {
         layoutMode: {
            compact: 'gap-1',
            standard: 'gap-1',
            wide: 'gap-1',
         },
         heightMode: {
            short: 'gap-0.5',
            regular: '',
         },
      },
      defaultVariants: {
         layoutMode: 'standard',
         heightMode: 'regular',
      },
   }),
   modeColumn: tv({
      base: 'flex flex-col min-w-0',
      variants: {
         layoutMode: {
            compact: 'gap-1 pt-2 border-t border-neutral-800',
            standard: 'gap-1 pt-2.5 border-t border-neutral-800',
            wide: 'gap-1 pt-0 border-t-0',
         },
         heightMode: {
            short: 'gap-0.5 pt-1.5',
            regular: '',
         },
      },
      compoundVariants: [
         {
            layoutMode: 'wide',
            heightMode: 'short',
            class: 'pt-0',
         },
      ],
      defaultVariants: {
         layoutMode: 'standard',
         heightMode: 'regular',
      },
   }),
   fieldLabel: tv({
      base: 'block font-semibold uppercase tracking-wider text-neutral-400 truncate',
      variants: {
         layoutMode: {
            compact: 'text-10!',
            standard: 'text-11!',
            wide: 'text-11!',
         },
         heightMode: {
            short: 'text-10!',
            regular: '',
         },
      },
      defaultVariants: {
         layoutMode: 'standard',
         heightMode: 'regular',
      },
   }),
   prizeRow: tv({
      base: 'flex items-center min-w-0',
      variants: {
         layoutMode: {
            compact: 'gap-1.5',
            standard: 'gap-2',
            wide: 'gap-2',
         },
      },
      defaultVariants: {
         layoutMode: 'standard',
      },
   }),
   selectInput: tv({
      base: [
         'flex-1 min-w-0 text-neutral-50 bg-neutral-950 border border-neutral-700',
         'rounded-primary focus:outline-none focus:border-warning-500 transition-colors cursor-pointer truncate',
      ],
      variants: {
         layoutMode: {
            compact: 'h-8 px-2 text-12',
            standard: 'h-9 px-3 text-13',
            wide: 'h-9 px-3 text-13',
         },
         heightMode: {
            short: 'h-8 py-0 text-12',
            regular: '',
         },
         disabled: {
            true: 'opacity-50 pointer-events-none cursor-not-allowed',
         },
      },
      defaultVariants: {
         layoutMode: 'standard',
         heightMode: 'regular',
      },
   }),
   syncIconBtn: tv({
      base: [
         'shrink-0 flex items-center justify-center rounded-primary bg-neutral-800 text-neutral-300',
         'hover:text-neutral-50 hover:bg-neutral-700 border border-neutral-700 transition-colors cursor-pointer',
      ],
      variants: {
         layoutMode: {
            compact: 'size-8',
            standard: 'size-9',
            wide: 'size-9',
         },
         heightMode: {
            short: 'size-8',
            regular: '',
         },
         disabled: {
            true: 'opacity-50 pointer-events-none cursor-not-allowed',
         },
      },
      defaultVariants: {
         layoutMode: 'standard',
         heightMode: 'regular',
      },
   }),
   syncIcon: tv({
      base: 'w-4 h-4 shrink-0',
      variants: {
         loading: {
            true: 'animate-spin',
         },
      },
      defaultVariants: {
         loading: false,
      },
   }),
   modeTabGroup: tv({
      base: 'grid grid-cols-3 gap-1 p-1 rounded-primary bg-neutral-950 border border-neutral-800 min-w-0',
      variants: {
         layoutMode: {
            compact: 'gap-0.5 p-0.5',
            standard: 'gap-1 p-1',
            wide: 'gap-1 p-1',
         },
      },
      defaultVariants: {
         layoutMode: 'standard',
      },
   }),
   modeTabBtn: tv({
      base: 'min-w-0 font-semibold capitalize rounded-primary transition-colors cursor-pointer truncate',
      variants: {
         layoutMode: {
            compact: 'py-1 px-1 text-11!',
            standard: 'py-1.5 px-1.5 text-13!',
            wide: 'py-1.5 px-1.5 text-13!',
         },
         heightMode: {
            short: 'py-1 text-11!',
            regular: '',
         },
         active: {
            true: 'bg-warning-500 text-neutral-950 shadow-xs',
            false: 'text-neutral-400 hover:text-neutral-200',
         },
         disabled: {
            true: 'opacity-50 pointer-events-none cursor-not-allowed',
         },
      },
      defaultVariants: {
         layoutMode: 'standard',
         heightMode: 'regular',
      },
   }),
   actionButtonsStack: tv({
      base: 'flex min-w-0',
      variants: {
         layoutMode: {
            compact: 'gap-1.5',
            standard: 'gap-2',
            wide: 'gap-1.5',
         },
         heightMode: {
            short: 'gap-1.5',
            regular: '',
         },
      },
      defaultVariants: {
         layoutMode: 'standard',
         heightMode: 'regular',
      },
   }),
   startDrawBtn: tv({
      base: [
         'inline-flex items-center justify-center w-full min-w-0 font-bold tracking-wider uppercase text-neutral-950',
         'transition-all bg-warning-500 rounded-primary shadow-lg hover:bg-warning-400 cursor-pointer',
      ],
      variants: {
         layoutMode: {
            compact: 'gap-1.5 px-2.5 py-2 text-12!',
            standard: 'gap-2 px-4 py-2.5 text-14!',
            wide: 'gap-2 px-3 py-2.75 text-12!',
         },
         heightMode: {
            short: 'py-2 text-12!',
            regular: '',
         },
         disabled: {
            true: 'opacity-40 pointer-events-none cursor-not-allowed',
         },
      },
      defaultVariants: {
         layoutMode: 'standard',
         heightMode: 'regular',
      },
   }),
   actionBtnText: tv({
      base: 'truncate',
   }),
   spinnerIcon: tv({
      base: 'w-4 h-4 animate-spin shrink-0',
   }),
   manualStopBtn: tv({
      base: [
         'w-full min-w-0 font-bold tracking-wider uppercase text-neutral-50 truncate',
         'transition-all bg-error-600 rounded-primary shadow-lg hover:bg-error-500 tabular-nums cursor-pointer',
      ],
      variants: {
         layoutMode: {
            compact: 'px-2.5 py-1.5 text-11!',
            standard: 'px-4 py-2 text-13',
            wide: 'px-3 py-1.5 text-12',
         },
         heightMode: {
            short: 'py-1.5 text-11!',
            regular: '',
         },
      },
      defaultVariants: {
         layoutMode: 'standard',
         heightMode: 'regular',
      },
   }),
   redrawAbsentBtn: tv({
      base: [
         'inline-flex items-center justify-center gap-2 w-full min-w-0 font-semibold tracking-wide text-warning-300',
         'bg-warning-950/60 hover:bg-warning-900/80 border border-warning-700/70 rounded-primary transition-colors cursor-pointer',
      ],
      variants: {
         layoutMode: {
            compact: 'px-2 py-1.5 text-11!',
            standard: 'px-3 py-2 text-12',
            wide: 'px-2.5 py-1.5 text-11!',
         },
         heightMode: {
            short: 'py-1 text-11!',
            regular: '',
         },
      },
      defaultVariants: {
         layoutMode: 'standard',
         heightMode: 'regular',
      },
   }),
   footerRow: tv({
      base: 'shrink-0 min-w-0',
      variants: {
         layoutMode: {
            compact: 'flex flex-col items-center gap-1 pt-1',
            standard: 'flex flex-col items-center gap-1.5 pt-1',
            wide: 'flex flex-row items-center justify-between gap-3 pt-1.5 border-t border-neutral-800/80',
         },
         heightMode: {
            short: 'gap-1 pt-0.5',
            regular: '',
         },
      },
      compoundVariants: [
         {
            layoutMode: 'wide',
            heightMode: 'short',
            class: 'pt-1',
         },
      ],
      defaultVariants: {
         layoutMode: 'standard',
         heightMode: 'regular',
      },
   }),
   shortcutHint: tv({
      base: 'text-neutral-500 min-w-0',
      variants: {
         layoutMode: {
            compact: 'text-10! text-center leading-snug',
            standard: 'text-11! text-center leading-snug',
            wide: 'text-11! text-left truncate flex-1',
         },
         heightMode: {
            short: 'text-10! truncate max-w-full',
            regular: '',
         },
      },
      defaultVariants: {
         layoutMode: 'standard',
         heightMode: 'regular',
      },
   }),
   logoutWrapper: tv({
      base: 'flex shrink-0',
      variants: {
         layoutMode: {
            compact: 'justify-center',
            standard: 'justify-center',
            wide: 'justify-end',
         },
      },
      defaultVariants: {
         layoutMode: 'standard',
      },
   }),
   logoutBtn: tv({
      base: 'px-3 py-1 rounded-primary text-11! bg-error-600 text-neutral-50 hover:bg-error-500 transition-colors cursor-pointer whitespace-nowrap',
   }),
   cornerGrip: tv({
      base: css.corner_grip,
   }),
};
