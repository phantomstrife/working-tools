import { tv } from 'tailwind-variants';

export const useStyle = {
   reelBox: tv({
      base: 'relative flex items-center justify-center h-full aspect-1/2 m-1 sm:m-2 overflow-hidden flex-1',
   }),
   charText: tv({
      base: 'absolute flex items-center justify-center w-full h-full text-22! sm:text-22! md:text-22! font-bold text-neutral-50 transition-all select-none',
      variants: {
         spinning: {
            true: 'opacity-80 scale-95 blur-[0.5px]',
            false: 'opacity-100 scale-100 animate-landing',
         },
      },
   }),
};
