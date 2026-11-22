import { tv } from 'tailwind-variants';

export const useStyle = {
   button: tv({
      base: [
         'fixed bottom-2 left-2 z-40 inline-flex items-center gap-x-1.5 px-2 py-0.5',
         'rounded-primary text-10 font-mono font-medium border backdrop-blur-sm',
         'transition-all cursor-pointer select-none',
      ],
      variants: {
         mismatch: {
            true: 'bg-warning-950/90 text-warning-300 border-warning-500/80 opacity-100 shadow-md hover:bg-warning-900',
            false: 'bg-neutral-900/75 text-neutral-300 border-neutral-700/60 opacity-75 hover:opacity-100',
         },
      },
      defaultVariants: {
         mismatch: false,
      },
   }),
   icon: tv({
      base: 'shrink-0',
      variants: {
         spinning: {
            true: 'animate-spin',
            false: '',
         },
      },
      defaultVariants: {
         spinning: false,
      },
   }),
};
