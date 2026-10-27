import { tv } from 'tailwind-variants';

const themes = {
   submit_button: tv({
      base: [
         'px-primary py-[calc(var(--spacing-primary)/2)] text-13 font-semibold text-neutral-50',
         'bg-neutral-900 rounded-primary hover:bg-neutral-950 transition-colors cursor-pointer',
      ],
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

export const modalFormStyle = {
   form: 'flex flex-col',
   grid: 'grid grid-cols-1 sm:grid-cols-2 gap-primary p-secondary',
   full_span: 'sm:col-span-2',
   footer: {
      wrapper: `flex items-center justify-end gap-x-[calc(var(--spacing-primary)/2)] px-secondary py-primary bg-neutral-100/50 border-t border-utility-200`,
      cancel_button: `px-primary py-[calc(var(--spacing-primary)/2)] text-neutral-700 text-13 font-medium bg-neutral-50 border border-utility-300 rounded-primary transition-colors cursor-pointer hover:bg-neutral-100`,
      submit_button: themes.submit_button,
   },
};

