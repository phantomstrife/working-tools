import { tv } from 'tailwind-variants';

export const useStyle = {
   wrapper: tv({
      base: 'flex items-center gap-x-1 border-b border-utility-400',
   }),
   tab: tv({
      base: 'px-primary py-2.5 text-13 font-medium border-b-2 transition-colors cursor-pointer -mb-px',
      variants: {
         active: {
            true: 'border-neutral-950 text-neutral-950 font-semibold',
            false: 'border-transparent text-neutral-500 hover:text-neutral-800',
         },
      },
      defaultVariants: {
         active: false,
      },
   }),
};

