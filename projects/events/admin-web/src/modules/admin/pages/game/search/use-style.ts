import { tv } from 'tailwind-variants';

export const useStyle = {
   wrapper: tv({
      base: 'flex flex-col gap-y-secondary max-w-7xl mx-auto p-secondary',
   }),
   cell: {
      gameWrapper: tv({
         base: 'flex flex-col gap-y-0.5',
      }),
      titleRow: tv({
         base: 'flex items-center gap-x-2',
      }),
      gameNameBtn: tv({
         base: 'text-14 font-semibold text-neutral-950 hover:text-primary-600 text-left cursor-pointer',
      }),
      devBadge: tv({
         base: 'inline-flex items-center px-2 py-0.5 text-10 font-semibold rounded-primary bg-question-50 text-question-700 border border-question-200',
      }),
      gameDesc: tv({
         base: 'text-12 text-neutral-500 line-clamp-1',
      }),
      typeBadge: tv({
         base: 'inline-flex items-center px-2.5 py-0.5 text-11 font-mono font-semibold rounded-primary bg-secondary-100 text-secondary-800 border border-secondary-200',
      }),
      staffCountBadge: tv({
         base: 'inline-flex items-center px-2.5 py-0.5 text-12 font-medium rounded-primary bg-neutral-100 text-neutral-800 border border-utility-400',
      }),
      statusBadge: tv({
         base: 'inline-flex items-center px-2.5 py-0.5 text-11 font-semibold rounded-primary border',
         variants: {
            status: {
               PENDING: 'bg-neutral-100 text-neutral-700 border-neutral-300',
               READY: 'bg-info-50 text-info-700 border-info-200',
               LIVE: 'bg-success-50 text-success-700 border-success-200',
               FINISHED: 'bg-primary-100 text-primary-700 border-primary-200',
            },
         },
         defaultVariants: {
            status: 'PENDING',
         },
      }),
   },
   iconLg: tv({
      base: 'w-6 h-6',
   }),
};

