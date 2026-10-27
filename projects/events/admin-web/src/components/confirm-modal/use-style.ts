import { tv } from 'tailwind-variants';

const themes = {
   confirm_button: tv({
      base: 'px-primary py-[calc(var(--spacing-primary)/2)] text-13 font-semibold text-neutral-50 bg-error-600 rounded-primary hover:bg-error-700 transition-colors cursor-pointer',
      variants: {
         disabled: {
            true: 'opacity-50 pointer-events-none cursor-not-allowed',
            false: '',
         },
      },
      defaultVariants: {
         disabled: false,
      },
   }),
};

export const useStyle = {
   message: 'text-neutral-700 text-14 leading-relaxed',
   cancel_button: `px-primary py-[calc(var(--spacing-primary)/2)] text-neutral-700 text-13 font-medium bg-neutral-50 border border-utility-300 rounded-primary transition-colors cursor-pointer hover:bg-neutral-100`,
   confirm_button: themes.confirm_button,
};

