import { tv } from 'tailwind-variants';

export const useStyle = {
   wrapper: tv({
      base: 'flex flex-col gap-y-secondary max-w-7xl mx-auto p-secondary',
   }),
   headerRow: tv({
      base: 'flex flex-col gap-y-3 sm:flex-row sm:items-center sm:justify-between',
   }),
   headerText: tv({
      base: 'flex flex-col gap-y-1',
   }),
   title: tv({
      base: 'text-24 font-semibold text-neutral-950 tracking-tight',
   }),
   subtitle: tv({
      base: 'text-14 text-neutral-500',
   }),
   exportBtn: tv({
      base: [
         'inline-flex items-center gap-x-2 px-primary py-2 text-13 font-medium text-neutral-50',
         'bg-neutral-900 rounded-primary hover:bg-neutral-950 transition-colors cursor-pointer shrink-0',
      ],
      variants: {
         disabled: {
            true: 'opacity-50 pointer-events-none cursor-not-allowed',
         },
      },
   }),
   iconSm: tv({
      base: 'w-4 h-4',
   }),
   iconLg: tv({
      base: 'w-5 h-5',
   }),
   tableCard: tv({
      base: 'bg-neutral-50 border border-utility-400 rounded-secondary shadow-xs overflow-hidden',
   }),
   tableScroll: tv({
      base: 'overflow-x-auto',
   }),
   table: tv({
      base: 'w-full text-left border-collapse',
   }),
   thead: tv({
      base: 'bg-neutral-100/80 border-b border-utility-400',
   }),
   th: tv({
      base: 'px-primary py-3 text-12 font-semibold uppercase tracking-wider text-neutral-600 whitespace-nowrap',
   }),
   tbody: tv({
      base: 'divide-y divide-neutral-200',
   }),
   tr: tv({
      base: 'hover:bg-neutral-100/60 transition-colors',
   }),
   td: tv({
      base: 'px-primary py-3.5 text-13 text-neutral-700 align-middle whitespace-nowrap',
   }),
   skeletonCell: tv({
      base: 'h-4 bg-neutral-200 rounded-primary animate-pulse w-3/4',
   }),
   emptyWrapper: tv({
      base: 'flex flex-col items-center justify-center py-16 px-primary text-center gap-y-3',
   }),
   emptyIconBox: tv({
      base: [
         'w-12 h-12 rounded-secondary bg-neutral-100 border border-utility-400',
         'flex items-center justify-center text-neutral-500',
      ],
   }),
   emptyTitle: tv({
      base: 'text-16 font-semibold text-neutral-950',
   }),
   emptyDesc: tv({
      base: 'text-13 text-neutral-500 max-w-md',
   }),
   emptyBtn: tv({
      base: [
         'mt-1 inline-flex items-center gap-x-2 px-primary py-2 text-13 font-medium',
         'text-neutral-700 bg-neutral-50 border border-utility-400 rounded-primary',
         'hover:bg-neutral-100 transition-colors cursor-pointer',
      ],
   }),
   paginationBar: tv({
      base: [
         'flex flex-col gap-y-3 sm:flex-row sm:items-center sm:justify-between',
         'px-primary py-3 bg-neutral-50 border-t border-utility-400',
      ],
   }),
   paginationInfo: tv({
      base: 'text-13 text-neutral-600',
   }),
   paginationControls: tv({
      base: 'flex items-center gap-x-3',
   }),
   limitSelect: tv({
      base: [
         'px-2.5 py-1.5 text-12 font-medium text-neutral-800 bg-neutral-50',
         'border border-utility-400 rounded-primary focus:outline-none focus:border-primary-500 cursor-pointer',
      ],
   }),
   pageBtnGroup: tv({
      base: 'flex items-center gap-x-1.5',
   }),
   pageBtn: tv({
      base: [
         'px-3 py-1.5 text-12 font-medium text-neutral-800 bg-neutral-50',
         'border border-utility-400 rounded-primary hover:bg-neutral-100 transition-colors cursor-pointer',
      ],
      variants: {
         disabled: {
            true: 'opacity-40 pointer-events-none cursor-not-allowed',
         },
      },
   }),
   cell: {
      winnerGroup: tv({
         base: 'flex flex-col gap-y-0.5',
      }),
      winnerName: tv({
         base: 'font-semibold text-neutral-950',
      }),
      winnerMeta: tv({
         base: 'text-12 text-neutral-500',
      }),
      ticketBadge: tv({
         base: [
            'inline-flex items-center px-2.5 py-0.5 rounded-primary font-mono',
            'text-12 font-semibold bg-neutral-100 text-neutral-900 border border-utility-400',
         ],
      }),
      prizeGroup: tv({
         base: 'flex flex-col gap-y-1',
      }),
      tierBadge: tv({
         base: [
            'inline-flex items-center px-2 py-0.5 rounded-primary w-fit',
            'text-10 font-semibold tracking-wide uppercase border',
            'bg-warning-50 text-warning-700 border-warning-200',
         ],
      }),
      prizeName: tv({
         base: 'text-13 font-semibold text-neutral-900',
      }),
      gameGroup: tv({
         base: 'flex flex-col gap-y-0.5',
      }),
      gameName: tv({
         base: 'text-13 font-medium text-neutral-900',
      }),
      eventName: tv({
         base: 'text-12 text-neutral-500',
      }),
   },
};

