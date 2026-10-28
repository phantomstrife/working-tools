import { tv } from 'tailwind-variants';

export const useStyle = {
   collapsedContainer: tv({
      base: 'fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2 select-none',
   }),
   expandedContainer: tv({
      base: 'fixed w-88 bottom-5 right-5 flex flex-col gap-3 z-50 select-none',
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
   collapsedPill: tv({
      base: [
         'flex items-center gap-2 p-1.5 rounded-primary bg-neutral-900/90',
         'border border-neutral-700/80 shadow-2xl backdrop-blur-md text-neutral-100',
      ],
   }),
   collapsedDrawBtn: tv({
      base: [
         'inline-flex items-center justify-center gap-1.5 px-4 py-1.5 text-12 font-bold tracking-wider uppercase rounded-primary',
         'bg-warning-500 text-neutral-950 hover:bg-warning-400 transition-colors cursor-pointer',
      ],
      variants: {
         disabled: {
            true: 'opacity-50 pointer-events-none cursor-not-allowed',
         },
      },
   }),
   collapsedStopBtn: tv({
      base: [
         'px-3 py-1.5 text-12 font-bold tracking-wider uppercase rounded-primary',
         'bg-error-600 text-neutral-50 hover:bg-error-500 transition-colors tabular-nums cursor-pointer',
      ],
   }),
   collapsedExpandBtn: tv({
      base: [
         'px-3 py-1.5 text-12 font-semibold text-neutral-300 hover:text-neutral-50',
         'rounded-primary hover:bg-neutral-800 transition-colors cursor-pointer',
      ],
   }),
   operatorCard: tv({
      base: [
         'flex flex-col gap-3.5 p-4 bg-neutral-900/95 border border-neutral-700/80',
         'rounded-secondary text-neutral-100 shadow-2xl backdrop-blur-md',
      ],
   }),
   cardHeader: tv({
      base: 'flex items-center justify-between border-b border-neutral-800 pb-2.5',
   }),
   cardHeaderTitleGroup: tv({
      base: 'flex items-center gap-2',
   }),
   statusDot: tv({
      base: 'w-2 h-2 rounded-full',
      variants: {
         live: {
            true: 'bg-success-400 animate-pulse',
            false: 'bg-warning-400',
         },
      },
   }),
   cardHeaderTitle: tv({
      base: 'font-bold text-12 tracking-wider text-warning-400 uppercase',
   }),
   cardHeaderActions: tv({
      base: 'flex items-center gap-1',
   }),
   syncBtn: tv({
      base: [
         'px-2 py-1 text-11 font-semibold rounded-primary bg-neutral-800 text-neutral-300',
         'hover:text-neutral-50 hover:bg-neutral-700 border border-neutral-700 transition-colors cursor-pointer',
      ],
      variants: {
         disabled: {
            true: 'opacity-50 pointer-events-none cursor-not-allowed',
         },
      },
   }),
   minimizeBtn: tv({
      base: [
         'px-2 py-1 text-11 font-semibold text-neutral-400 hover:text-neutral-50',
         'rounded-primary hover:bg-neutral-800 transition-colors cursor-pointer',
      ],
   }),
   accountRow: tv({
      base: 'flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-primary bg-neutral-950/70 border border-neutral-800 text-11',
   }),
   accountName: tv({
      base: 'font-semibold text-neutral-200 truncate',
   }),
   accountActions: tv({
      base: 'flex items-center gap-1.5 shrink-0',
   }),
   guardSwitchBtn: tv({
      base: [
         'px-2 py-0.5 text-11 font-semibold text-info-300 bg-info-950/70 hover:bg-info-900/80',
         'border border-info-800/70 rounded-primary transition-colors cursor-pointer',
      ],
   }),
   logoutBtn: tv({
      base: [
         'px-2 py-0.5 text-11 font-semibold text-error-300 bg-error-950/70 hover:bg-error-900/80',
         'border border-error-800/70 rounded-primary transition-colors cursor-pointer',
      ],
   }),
   selectorsGroup: tv({
      base: 'flex flex-col gap-2.5',
   }),
   fieldGroup: tv({
      base: 'flex flex-col gap-1',
   }),
   fieldHeaderRow: tv({
      base: 'flex items-center justify-between',
   }),
   fieldLabel: tv({
      base: 'block text-11 font-semibold uppercase tracking-wider text-neutral-400',
   }),
   winnersToggleBtn: tv({
      base: 'text-11 font-semibold text-warning-400 hover:text-warning-300 transition-colors cursor-pointer',
   }),
   selectInput: tv({
      base: [
         'w-full px-3 py-2 text-13 text-neutral-50 bg-neutral-950 border border-neutral-700',
         'rounded-primary focus:outline-none focus:border-warning-500 transition-colors cursor-pointer',
      ],
      variants: {
         disabled: {
            true: 'opacity-50 pointer-events-none cursor-not-allowed',
         },
      },
   }),
   telemetryGrid: tv({
      base: 'grid grid-cols-3 gap-2 pt-1',
   }),
   telemetryBox: tv({
      base: 'p-2 rounded-primary bg-neutral-950/70 border border-neutral-800 text-center',
   }),
   telemetryLabel: tv({
      base: 'text-10 font-semibold uppercase tracking-wider text-neutral-400',
   }),
   telemetryValue: tv({
      base: 'text-16 font-bold tabular-nums mt-0.5',
      variants: {
         tone: {
            white: 'text-neutral-50',
            emerald: 'text-success-400',
            yellow: 'text-warning-400',
         },
      },
   }),
   controlsSection: tv({
      base: 'flex flex-col gap-3 pt-2 border-t border-neutral-800',
   }),
   modeTabGroup: tv({
      base: 'grid grid-cols-3 gap-1 p-1 rounded-primary bg-neutral-950 border border-neutral-800',
   }),
   modeTabBtn: tv({
      base: 'py-1.5 text-12 font-semibold capitalize rounded-primary transition-colors cursor-pointer',
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
         'inline-flex items-center justify-center gap-2 w-full px-4 py-3 font-bold text-13 tracking-wider uppercase text-neutral-950',
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
      base: 'text-10 text-center text-neutral-500 pt-1',
   }),
};

