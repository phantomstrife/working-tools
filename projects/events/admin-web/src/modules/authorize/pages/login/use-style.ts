import { tv } from 'tailwind-variants';

export const useStyle = {
   wrapper: tv({
      base: 'flex flex-col items-center gap-y-secondary',
   }),
   topBlock: {
      wrapper: tv({
         base: 'flex flex-col items-center gap-y-1',
      }),
      icon: tv({
         base: 'p-primary mb-primary bg-neutral-50 text-neutral-950 rounded-secondary shadow-xl',
      }),
      header: tv({
         base: 'text-30! font-semibold text-neutral-950',
      }),
      description: tv({
         base: 'text-neutral-500 text-center',
      }),
   },
   formBlock: {
      wrapper: tv({
         base: 'flex flex-col gap-y-2 w-full',
      }),
      input: {
         wrapper: tv({
            base: 'flex items-center gap-x-primary w-full px-4 py-2.5 bg-[#eff3f6] border border-transparent rounded-secondary',
         }),
         field: tv({
            base: 'w-full transition-colors placeholder-neutral-400 focus:outline-none',
         }),
      },
   },
   errorBlock: {
      wrapper: tv({
         base: 'text-red-600! text-14 font-semibold',
      }),
   },
   toolBlock: {
      wrapper: tv({
         base: 'flex items-center justify-between w-full',
      }),
      button: tv({
         base: 'py-3 px-primary w-full text-neutral-50 bg-neutral-900 rounded-secondary hover:bg-neutral-950 ',
         variants: {
            loading: {
               true: 'opacity-60 cursor-not-allowed',
            },
         },
         defaultVariants: {
            loading: false,
         },
      }),
   },
};
