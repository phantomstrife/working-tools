import { tv } from 'tailwind-variants';

export const useStyle = {
   expandedContainer: tv({
      base: 'fixed inset-x-3 bottom-3 sm:inset-x-auto sm:right-5 sm:bottom-5 sm:w-88 max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-2.5rem)] flex flex-col gap-2.5 z-50 select-none',
   }),
   noticeBanner: tv({
      base: [
         'flex items-start justify-between gap-2 px-3.5 py-2.5 rounded-secondary border',
         'text-12 font-medium shadow-2xl backdrop-blur-md cursor-pointer',
      ],
      variants: {
         kind: {
            error: 'bg-error-950/90 border-error-800 text-error-200',
            warning: 'bg-warning-950/90 border-warning-700 text-warning-200',
            info: 'bg-info-950/90 border-info-700 text-info-200',
         },
      },
   }),
   noticeCloseBtn: tv({
      base: 'text-current opacity-70 hover:opacity-100 font-bold leading-none cursor-pointer',
   }),
   operatorCard: tv({
      base: [
         'flex flex-col gap-3.5 p-4 bg-neutral-900/95 border border-neutral-700/80',
         'rounded-secondary text-neutral-100 shadow-2xl backdrop-blur-md overflow-y-auto',
      ],
   }),
   fieldGroup: tv({
      base: 'flex flex-col gap-1',
   }),
   fieldLabel: tv({
      base: 'block text-12! font-semibold uppercase tracking-wider text-neutral-400',
   }),
   prizeRow: tv({
      base: 'flex items-center gap-2',
   }),
   selectInput: tv({
      base: [
         'flex-1 min-w-0 px-3 py-2 text-13 text-neutral-50 bg-neutral-950 border border-neutral-700',
         'rounded-primary focus:outline-none focus:border-warning-500 transition-colors cursor-pointer',
      ],
      variants: {
         disabled: {
            true: 'opacity-50 pointer-events-none cursor-not-allowed',
         },
      },
   }),
   syncIconBtn: tv({
      base: [
         'size-9 shrink-0 flex items-center justify-center rounded-primary bg-neutral-800 text-neutral-300',
         'hover:text-neutral-50 hover:bg-neutral-700 border border-neutral-700 transition-colors cursor-pointer',
      ],
      variants: {
         disabled: {
            true: 'opacity-50 pointer-events-none cursor-not-allowed',
         },
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
   controlsSection: tv({
      base: 'flex flex-col gap-3 pt-2 border-t border-neutral-800',
   }),
   modeTabGroup: tv({
      base: 'grid grid-cols-3 gap-1 p-1 rounded-primary bg-neutral-950 border border-neutral-800',
   }),
   modeTabBtn: tv({
      base: 'py-1.5 text-14! font-semibold capitalize rounded-primary transition-colors cursor-pointer',
      variants: {
         active: {
            true: 'bg-warning-500 text-neutral-950 shadow-xs',
            false: 'text-neutral-400 hover:text-neutral-200',
         },
         disabled: {
            true: 'opacity-50 pointer-events-none cursor-not-allowed',
         },
      },
   }),
   actionButtonsStack: tv({
      base: 'flex flex-col gap-2',
   }),
   startDrawBtn: tv({
      base: [
         'inline-flex items-center justify-center gap-2 w-full px-4 py-3 font-bold text-14! tracking-wider uppercase text-neutral-950',
         'transition-all bg-warning-500 rounded-primary shadow-lg hover:bg-warning-400 cursor-pointer',
      ],
      variants: {
         disabled: {
            true: 'opacity-40 pointer-events-none cursor-not-allowed',
         },
      },
   }),
   spinnerIcon: tv({
      base: 'w-4 h-4 animate-spin shrink-0',
   }),
   manualStopBtn: tv({
      base: [
         'w-full px-4 py-2.5 font-bold text-13 tracking-wider uppercase text-neutral-50',
         'transition-all bg-error-600 rounded-primary shadow-lg hover:bg-error-500 tabular-nums cursor-pointer',
      ],
   }),
   redrawAbsentBtn: tv({
      base: [
         'inline-flex items-center justify-center gap-2 w-full px-3 py-2 font-semibold text-12 tracking-wide text-warning-300',
         'bg-warning-950/60 hover:bg-warning-900/80 border border-warning-700/70 rounded-primary transition-colors cursor-pointer',
      ],
   }),
   shortcutHint: tv({
      base: 'text-11! text-center text-neutral-500 pt-1',
   }),
   logoutWrapper: tv({
      base: 'flex justify-center',
   }),
   logoutBtn: tv({
      base: 'text-11 text-neutral-400 hover:text-error-400 underline-offset-2 hover:underline transition-colors cursor-pointer',
   }),
};
