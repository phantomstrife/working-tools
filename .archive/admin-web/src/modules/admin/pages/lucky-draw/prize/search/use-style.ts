import { tv } from 'tailwind-variants';

export const useStyle = {
   wrapper: tv({
      base: 'flex flex-col gap-y-secondary max-w-7xl mx-auto p-secondary',
   }),
   iconLg: tv({
      base: 'w-5 h-5',
   }),
   cell: {
      prizeWrapper: tv({
         base: 'flex items-center gap-x-3',
      }),
      thumb: tv({
         base: [
            'w-10 h-10 rounded-primary border border-utility-400 bg-neutral-100',
            'flex items-center justify-center overflow-hidden shrink-0 text-neutral-400',
         ],
      }),
      thumbImg: tv({
         base: 'w-full h-full object-cover',
      }),
      textGroup: tv({
         base: 'flex flex-col gap-y-0.5 min-w-0',
      }),
      prizeNameBtn: tv({
         base: 'font-semibold text-neutral-950 hover:text-primary-600 transition-colors text-left truncate',
      }),
      prizeDesc: tv({
         base: 'text-12 text-neutral-500 truncate max-w-xs',
      }),
      tierBadge: tv({
         base: [
            'inline-flex items-center px-2.5 py-0.5 rounded-primary',
            'text-11 font-semibold tracking-wide uppercase border',
            'bg-primary-100/70 text-primary-800 border-primary-300',
         ],
      }),
      quantityWrapper: tv({
         base: 'flex flex-col gap-y-1',
      }),
      quantityText: tv({
         base: 'text-13 font-semibold text-neutral-900',
      }),
      stockBadge: tv({
         base: 'inline-flex items-center px-2 py-0.5 rounded-primary text-11 font-semibold border w-fit',
         variants: {
            state: {
               IN_STOCK: 'bg-success-50 text-success-700 border-success-200',
               LOW_STOCK: 'bg-warning-50 text-warning-700 border-warning-200',
               DEPLETED: 'bg-error-50 text-error-700 border-error-200',
            },
         },
      }),
      gameCell: tv({
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

