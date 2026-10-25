import { tv } from 'tailwind-variants';

export const useStyle = {
   container: tv({
      base: 'bg-neutral-50 border border-utility-400 rounded-secondary overflow-visible',
   }),
   scrollWrapper: tv({
      base: 'w-full',
   }),
   table: tv({
      base: 'w-full border-collapse text-left',
   }),
   thead: tv({
      base: 'bg-neutral-100 border-b border-utility-400',
   }),
   th: tv({
      base: 'px-primary py-3 text-12 font-semibold uppercase tracking-wider text-neutral-600',
   }),
   thCheckbox: tv({
      base: 'w-10 px-primary py-3 text-center',
   }),
   thAction: tv({
      base: 'w-16 px-primary py-3 text-right',
   }),
   tbody: tv({
      base: 'divide-y divide-neutral-200',
   }),
   tr: tv({
      base: 'hover:bg-neutral-100/60 transition-colors',
      variants: {
         selected: {
            true: 'bg-primary-100/30',
         },
      },
   }),
   td: tv({
      base: 'px-primary py-3.5 text-13 text-neutral-800 align-middle',
   }),
   tdCheckbox: tv({
      base: 'w-10 px-primary py-3.5 text-center align-middle',
   }),
   tdAction: tv({
      base: 'w-16 px-primary py-3.5 text-right align-middle relative',
   }),
   checkbox: tv({
      base: 'w-4 h-4 rounded-primary border-utility-400 text-neutral-900 cursor-pointer',
   }),
   menuTrigger: tv({
      base: [
         'inline-flex items-center justify-center p-1.5 text-neutral-500',
         'rounded-primary hover:bg-neutral-200 hover:text-neutral-950 transition-colors cursor-pointer',
      ],
   }),
   menuDropdown: tv({
      base: [
         'absolute right-4 top-11 z-30 w-40 py-1 bg-neutral-50',
         'border border-utility-400 rounded-secondary shadow-lg',
      ],
   }),
   menuItem: tv({
      base: [
         'w-full flex items-center gap-x-2 px-3 py-2 text-13 text-neutral-800',
         'hover:bg-neutral-100 transition-colors cursor-pointer text-left',
      ],
      variants: {
         danger: {
            true: 'text-error-600 hover:bg-error-50',
         },
      },
   }),
   skeletonRow: tv({
      base: 'h-4 w-full bg-neutral-200 animate-pulse rounded-primary',
   }),
   emptyBlock: {
      wrapper: tv({
         base: 'flex flex-col items-center justify-center py-12 px-secondary text-center gap-y-2',
      }),
      iconBox: tv({
         base: 'p-3 bg-neutral-100 text-neutral-600 rounded-secondary mb-1',
      }),
      title: tv({
         base: 'text-16 font-semibold text-neutral-950',
      }),
      description: tv({
         base: 'text-13 text-neutral-500 max-w-md mb-2',
      }),
      secondaryBtn: tv({
         base: [
            'inline-flex items-center gap-x-2 px-primary py-2 text-13 font-medium text-neutral-800',
            'bg-neutral-50 border border-utility-400 rounded-primary',
            'hover:bg-neutral-100 transition-colors cursor-pointer',
         ],
      }),
      primaryBtn: tv({
         base: [
            'inline-flex items-center gap-x-2 px-primary py-2 text-13 font-medium text-neutral-50',
            'bg-neutral-900 rounded-primary hover:bg-neutral-950 transition-colors cursor-pointer',
         ],
      }),
   },
   paginationBlock: {
      wrapper: tv({
         base: [
            'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3',
            'px-primary py-3 border-t border-utility-400 bg-neutral-50 rounded-b-secondary',
         ],
      }),
      summary: tv({
         base: 'text-13 text-neutral-600',
      }),
      controls: tv({
         base: 'flex items-center gap-x-3',
      }),
      limitSelect: tv({
         base: 'px-2.5 py-1.5 text-12 text-neutral-800 bg-neutral-50 border border-utility-400 rounded-primary',
      }),
      navGroup: tv({
         base: 'flex items-center gap-x-1.5',
      }),
      pageIndicator: tv({
         base: 'text-13 font-medium text-neutral-800 px-2',
      }),
      pageBtn: tv({
         base: [
            'inline-flex items-center justify-center p-1.5 text-neutral-700',
            'bg-neutral-50 border border-utility-400 rounded-primary',
            'hover:bg-neutral-100 transition-colors cursor-pointer',
         ],
         variants: {
            disabled: {
               true: 'opacity-40 pointer-events-none cursor-not-allowed',
            },
         },
      }),
   },
   icon: {
      xs: tv({
         base: 'w-3.5 h-3.5',
      }),
      sm: tv({
         base: 'w-4 h-4',
      }),
      lg: tv({
         base: 'w-6 h-6',
      }),
   },
};
