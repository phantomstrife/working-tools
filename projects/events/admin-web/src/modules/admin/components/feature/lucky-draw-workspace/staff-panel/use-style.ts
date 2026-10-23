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
   tbody: tv({
      base: 'divide-y divide-neutral-200',
   }),
   tr: tv({
      base: 'hover:bg-neutral-100/50 transition-colors',
   }),
   td: tv({
      base: 'px-primary py-3 text-13 text-neutral-700 align-middle whitespace-nowrap',
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
   emptyState: tv({
      base: 'py-12 px-primary text-center text-13 text-neutral-500',
   }),
   skeletonRow: tv({
      base: 'h-4 bg-neutral-200 rounded-primary animate-pulse w-3/4',
   }),
   iconSm: tv({
      base: 'w-3.5 h-3.5',
   }),
};

