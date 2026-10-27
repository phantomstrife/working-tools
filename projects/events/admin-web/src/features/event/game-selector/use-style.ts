import { tv } from 'tailwind-variants';

const themes = {
   action_button: tv({
      base: [
         'inline-flex items-center justify-center gap-x-1.5 h-7 px-2.5 text-12 font-semibold',
         'rounded-primary transition-colors cursor-pointer shrink-0',
      ],
      variants: {
         variant: {
            primary: 'text-neutral-50 bg-neutral-900 hover:bg-neutral-950 shadow-2xs',
            secondary: 'text-neutral-700 bg-neutral-50 border border-utility-300 hover:bg-neutral-100',
            danger: 'text-error-700 bg-error-50/70 border border-error-200 hover:bg-error-100/80',
         },
         disabled: {
            true: 'opacity-45 pointer-events-none cursor-not-allowed',
            false: '',
         },
      },
      defaultVariants: {
         variant: 'secondary',
         disabled: false,
      },
   }),
};

export const useStyle = {
   root: {
      wrapper: `grid grid-cols-[1fr_auto_1fr] items-center gap-primary p-secondary bg-neutral-50 border border-utility-300 rounded-secondary shadow-xl`,
   },
   field: {
      column: 'flex flex-col gap-y-2',
      toolbar: 'flex items-center justify-end gap-x-1.5 pt-2',
      action_button: themes.action_button,
      arrow: '-mt-[calc(var(--spacing-primary))]',
      select: 'w-full h-full text-14',
   },
};
