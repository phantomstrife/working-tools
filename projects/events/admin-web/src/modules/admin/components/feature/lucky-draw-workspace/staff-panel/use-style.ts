import { tv } from 'tailwind-variants';

export const useStyle = {
   panel: tv({
      base: 'bg-neutral-50 border border-utility-400 rounded-secondary shadow-xs flex flex-col overflow-hidden',
   }),
   header: tv({
      base: 'flex flex-wrap items-center justify-between gap-2 px-secondary py-primary border-b border-neutral-200',
   }),
   titleGroup: tv({
      base: 'flex items-center gap-x-2',
   }),
   title: tv({
      base: 'text-16 font-semibold text-neutral-950',
   }),
   countPill: tv({
      base: 'inline-flex items-center px-2 py-0.5 rounded-primary text-11 font-semibold bg-neutral-100 text-neutral-700 border border-neutral-300',
   }),
   actionsGroup: tv({
      base: 'flex flex-wrap items-center gap-1.5',
   }),
   hiddenInput: tv({
      base: 'hidden',
   }),
   secondaryBtn: tv({
      base: [
         'inline-flex items-center gap-x-1.5 px-2.5 py-1.5 text-12 font-semibold text-neutral-800',
         'bg-neutral-50 border border-utility-400 rounded-primary hover:bg-neutral-100 transition-colors cursor-pointer',
      ],
      variants: {
         disabled: {
            true: 'opacity-50 pointer-events-none cursor-not-allowed',
         },
      },
   }),
   primaryBtn: tv({
      base: [
         'inline-flex items-center gap-x-1.5 px-3 py-1.5 text-12 font-semibold text-neutral-50',
         'bg-neutral-900 rounded-primary hover:bg-neutral-950 transition-colors cursor-pointer',
      ],
      variants: {
         disabled: {
            true: 'opacity-50 pointer-events-none cursor-not-allowed',
         },
      },
   }),
   toolbar: tv({
      base: 'flex items-center gap-2 px-secondary py-3 bg-neutral-100/60 border-b border-neutral-200',
   }),
   searchBox: tv({
      base: 'relative flex-1 min-w-0',
   }),
   searchIcon: tv({
      base: 'w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none',
   }),
   searchInput: tv({
      base: [
         'w-full pl-9 pr-8 py-1.5 text-13 text-neutral-950 bg-neutral-50',
         'border border-utility-400 rounded-primary focus:outline-none focus:border-primary-500',
      ],
   }),
   clearSearchBtn: tv({
      base: 'p-1 text-neutral-400 hover:text-neutral-700 absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer',
   }),
   tableScroll: tv({
      base: 'overflow-x-auto max-h-120 overflow-y-auto',
   }),
   table: tv({
      base: 'w-full text-left border-collapse',
   }),
   thead: tv({
      base: 'bg-neutral-100 border-b border-utility-400 sticky top-0 z-10',
   }),
   th: tv({
      base: 'px-primary py-2.5 text-11 font-semibold uppercase tracking-wider text-neutral-600 whitespace-nowrap',
   }),
   thRight: tv({
      base: 'px-primary py-2.5 text-11 font-semibold uppercase tracking-wider text-neutral-600 whitespace-nowrap text-right',
   }),
   tbody: tv({
      base: 'divide-y divide-neutral-200',
   }),
   tr: tv({
      base: 'hover:bg-neutral-100/50 transition-colors',
   }),
   td: tv({
      base: 'px-primary py-3 text-13 text-neutral-700 align-middle whitespace-nowrap',
   }),
   tdRight: tv({
      base: 'px-primary py-3 text-13 text-neutral-700 align-middle whitespace-nowrap text-right',
   }),
   nameText: tv({
      base: 'font-semibold text-neutral-950',
   }),
   roleBadge: tv({
      base: 'inline-flex items-center px-2 py-0.5 rounded-primary text-11 font-semibold uppercase tracking-wide border',
      variants: {
         role: {
            SUPER_ADMIN: 'bg-primary-100/70 text-primary-800 border-primary-300',
            ADMIN: 'bg-secondary-100/70 text-secondary-800 border-secondary-300',
            FIELD_STAFF: 'bg-info-50 text-info-700 border-info-200',
            GUARD: 'bg-warning-50 text-warning-700 border-warning-200',
         },
      },
   }),
   activeBadge: tv({
      base: 'inline-flex items-center px-2 py-0.5 rounded-primary text-11 font-semibold border',
      variants: {
         active: {
            true: 'bg-success-50 text-success-700 border-success-200',
            false: 'bg-neutral-100 text-neutral-600 border-neutral-300',
         },
      },
   }),
   rowActions: tv({
      base: 'inline-flex items-center justify-end gap-x-1',
   }),
   actionIconBtn: tv({
      base: [
         'p-1.5 rounded-primary text-neutral-600 hover:text-neutral-950 hover:bg-neutral-200/70',
         'transition-colors cursor-pointer',
      ],
      variants: {
         danger: {
            true: 'text-error-600 hover:text-error-700 hover:bg-error-50',
         },
      },
   }),
   emptyState: tv({
      base: 'py-12 px-primary text-center text-13 text-neutral-500',
   }),
   skeletonRow: tv({
      base: 'h-4 bg-neutral-200 rounded-primary animate-pulse w-3/4',
   }),
   iconSm: tv({
      base: 'w-3.5 h-3.5',
   }),
   iconMd: tv({
      base: 'w-4 h-4',
   }),
   checkboxRow: tv({
      base: 'col-span-1 sm:col-span-2 flex items-center gap-x-3 p-3 bg-neutral-100/70 border border-utility-400 rounded-primary',
   }),
   checkboxInput: tv({
      base: 'w-4 h-4 rounded-primary border-utility-400 accent-neutral-900 cursor-pointer',
   }),
   checkboxLabel: tv({
      base: 'text-13 font-medium text-neutral-900 cursor-pointer',
   }),
   modal: {
      backdrop: tv({
         base: [
            'fixed inset-0 z-50 flex items-center justify-center p-primary',
            'bg-neutral-950/50 backdrop-blur-xs',
         ],
      }),
      panel: tv({
         base: [
            'w-full max-w-xl max-h-[90vh] overflow-y-auto',
            'bg-neutral-50 border border-utility-400 rounded-secondary shadow-xl flex flex-col',
         ],
      }),
      header: tv({
         base: 'flex items-center justify-between px-secondary py-primary border-b border-utility-400 sticky top-0 bg-neutral-50 z-10',
      }),
      headerTitle: tv({
         base: 'text-18 font-semibold text-neutral-950',
      }),
      closeBtn: tv({
         base: 'p-1.5 text-neutral-500 hover:text-neutral-900 rounded-primary hover:bg-neutral-100 transition-colors cursor-pointer',
      }),
      body: tv({
         base: 'p-secondary grid grid-cols-1 sm:grid-cols-2 gap-primary',
      }),
      footer: tv({
         base: 'flex items-center justify-end gap-x-2 px-secondary py-primary border-t border-utility-400 bg-neutral-100/50',
      }),
      cancelBtn: tv({
         base: [
            'px-primary py-2 text-13 font-medium text-neutral-700',
            'bg-neutral-50 border border-utility-400 rounded-primary hover:bg-neutral-100 transition-colors cursor-pointer',
         ],
      }),
      saveBtn: tv({
         base: [
            'px-primary py-2 text-13 font-medium text-neutral-50',
            'bg-neutral-900 rounded-primary hover:bg-neutral-950 transition-colors cursor-pointer',
         ],
         variants: {
            disabled: {
               true: 'opacity-50 pointer-events-none cursor-not-allowed',
            },
         },
      }),
   },
};
