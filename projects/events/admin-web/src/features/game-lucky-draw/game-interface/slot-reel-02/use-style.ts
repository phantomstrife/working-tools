import { tv } from 'tailwind-variants';

export const useStyle = {
   reelBox: tv({
      base: 'relative flex items-center justify-center overflow-hidden flex-1',
      variants: {
         variant: {
            default: 'h-full aspect-1/2 m-1 sm:m-2',
            bordered: 'h-full rounded-[0.65cqw] border-[0.16cqw] border-primary-600/80 bg-transparent',
         },
      },
      defaultVariants: {
         variant: 'default',
      },
   }),
   charText: tv({
      base: 'absolute flex items-center justify-center w-full h-full font-bold transition-all select-none',
      variants: {
         variant: {
            default: 'text-26! text-neutral-50',
            bordered: 'text-[4.4cqw] leading-none font-extrabold text-primary-700',
         },
         spinning: {
            true: 'opacity-80 scale-95 blur-[0.5px]',
            false: 'opacity-100 scale-100 animate-landing',
         },
      },
      defaultVariants: {
         variant: 'default',
      },
   }),
};
