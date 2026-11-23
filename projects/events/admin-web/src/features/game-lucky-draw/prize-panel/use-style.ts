import { tv } from 'tailwind-variants';

const themes = {
   prize_image: tv({
      base: 'size-full object-cover',
      variants: {
         depleted: {
            true: 'opacity-60 grayscale',
         },
      },
      defaultVariants: {
         depleted: false,
      },
   }),
   stock_bar_fill: tv({
      base: 'h-full rounded-full transition-all',
      variants: {
         status: {
            IN_STOCK: 'bg-success-500',
            LOW_STOCK: 'bg-warning-500',
            DEPLETED: 'bg-error-600',
         },
      },
      defaultVariants: {
         status: 'IN_STOCK',
      },
   }),
   status_badge: tv({
      base: 'inline-flex items-center px-[calc(var(--spacing-primary)*5/8)] h-6 rounded-primary text-11 font-bold border',
      variants: {
         status: {
            IN_STOCK: 'bg-success-50 text-success-700 border-success-200',
            LOW_STOCK: 'bg-warning-50 text-warning-700 border-warning-200',
            DEPLETED: 'bg-error-50 text-error-700 border-error-200',
         },
      },
      defaultVariants: {
         status: 'IN_STOCK',
      },
   }),
};

export const useStyle = {
   tier_badge: `inline-flex items-center px-[calc(var(--spacing-primary)*5/8)] py-[2px] rounded-primary text-12 font-bold uppercase border bg-primary-100 text-primary-800 border-primary-300`,
   prize: {
      wrapper: 'flex items-center gap-[calc(var(--spacing-primary)*3/4)]',
      thumb: 'relative size-10 rounded-primary border border-utility-300 bg-neutral-100 flex items-center justify-center shrink-0 text-neutral-500 shadow-xs overflow-hidden',
      image: themes.prize_image,
      icon: 'size-5',
      info: 'min-w-0',
      name: 'text-14 font-bold text-neutral-900 truncate max-w-36 sm:max-w-50',
      description: 'text-12 text-neutral-500 truncate max-w-36 sm:max-w-50',
      designated_badge:
         'inline-flex items-center gap-x-1 mt-1 px-2 py-0.5 rounded-primary text-11 font-semibold bg-info-50 text-info-700 border border-info-200',
   },
   stock: {
      wrapper: 'flex flex-col gap-1',
      text: 'text-13 font-bold text-neutral-900',
      total: 'text-neutral-400 font-medium',
      track: 'w-16 h-1.5 bg-neutral-200 rounded-full overflow-hidden',
      fill: themes.stock_bar_fill,
   },
   status_badge: themes.status_badge,
};

