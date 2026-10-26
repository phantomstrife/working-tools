import { tv } from 'tailwind-variants';

const themes = {
   button: tv({
      base: 'size-3.5 text-neutral-400 transition-colors cursor-pointer hover:text-primary-600',
      variants: {
         executed: {
            true: 'text-success-600',
            false: '',
         },
      },
      defaultVariants: {
         executed: false,
      },
   }),
};

export const useStyle = {
   root: {
      wrapper: themes.button,
   },
};
