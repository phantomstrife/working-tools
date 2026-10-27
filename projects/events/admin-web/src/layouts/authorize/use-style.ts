import { tv } from 'tailwind-variants';

export const useStyle = {
   root: {
      wrapper: tv({
         base: 'flex items-center justify-center min-h-screen',
      }),
   },
   content: {
      wrapper: tv({
         base: [
            'p-[calc(var(--spacing-primary)*2)] max-w-130 shadow-xl',
            'bg-neutral-50 bg-linear-to-b from-info-50 to-neutral-50',
            'border border-utility-300 rounded-[calc(var(--radius-primary)*4)]',
         ],
      }),
   },
};
