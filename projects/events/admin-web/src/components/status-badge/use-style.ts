import { tv } from 'tailwind-variants';

const themes = {
   status: tv({
      slots: {
         wrapper: 'flex items-center gap-[calc(var(--spacing-primary)/2)] px-primary py-1 rounded-full',
         dot: 'size-1.5 rounded-full',
      },
      variants: {
         status: {
            ACTIVE: {
               wrapper: 'bg-success-100 text-success-700',
               dot: 'bg-success-500 animate-pulse',
            },
            INACTIVE: {
               wrapper: 'bg-error-100 text-error-700',
               dot: 'bg-error-500',
            },
            SUSPENDED: {
               wrapper: 'bg-neutral-200 text-neutral-950',
               dot: 'bg-neutral-500',
            },
         },
      },
      defaultVariants: {
         status: 'SUSPENDED',
      },
   }),
};

export const useStyle = {
   root: {
      status: themes.status,
      text: 'text-11 font-semibold capitalize',
   },
};
