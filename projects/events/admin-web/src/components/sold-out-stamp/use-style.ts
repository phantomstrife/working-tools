import { tv } from 'tailwind-variants';

const themes = {
   stamp: tv({
      slots: {
         wrapper:
            'pointer-events-none absolute inset-0 z-10 flex items-center justify-center overflow-hidden select-none',
         label: [
            'inline-flex items-center justify-center -rotate-[30deg] whitespace-nowrap',
            'font-black uppercase leading-none text-error-600 bg-neutral-50/85',
            'border-error-600 shadow-lg',
         ],
      },
      variants: {
         size: {
            sm: {
               label: 'px-1 py-0.5 text-8! tracking-wide border rounded-[3px]',
            },
            md: {
               label: 'px-2 py-1 text-12! tracking-wider border-2 rounded-primary',
            },
            lg: {
               label: 'px-3 py-1.5 sm:px-5 sm:py-2 text-14! sm:text-24 tracking-[0.2em] border-4 border-double rounded-primary',
            },
         },
      },
      defaultVariants: {
         size: 'md',
      },
   }),
};

export const useStyle = {
   root: themes.stamp,
};
