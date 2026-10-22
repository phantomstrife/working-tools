import { tv } from 'tailwind-variants';

export const useStyle = {
   wrapper: tv({
      base: 'flex items-center justify-center min-h-screen',
   }),
   panel: tv({
      base: [
         'p-[calc(var(--spacing-primary)*2)] max-w-125',
         'bg-neutral-50 bg-linear-to-b from-info-50 to-neutral-50',
         'border border-utility-400 rounded-[calc(var(--radius-primary)*4)]',
         'shadow-xl',
      ],
   }),
};
