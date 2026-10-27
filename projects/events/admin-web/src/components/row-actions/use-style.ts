import { tv } from 'tailwind-variants';

const themes = {
   button: tv({
      base: 'p-[calc(var(--spacing-primary)*3/8)] rounded-primary transition-colors cursor-pointer',
      variants: {
         danger: {
            true: 'text-error-600 hover:bg-error-50',
            false: 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200',
         },
      },
      defaultVariants: {
         danger: false,
      },
   }),
};

export const useStyle = {
   wrapper: 'inline-flex items-center justify-end gap-[calc(var(--spacing-primary)*3/8)]',
   button: themes.button,
   icon: 'size-4',
};

