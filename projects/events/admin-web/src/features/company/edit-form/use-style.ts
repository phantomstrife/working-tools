import { tv } from 'tailwind-variants';

const themes = {
   modal: tv({
      base: 'fixed inset-0 z-50 flex items-center justify-center p-primary bg-neutral-950/50 backdrop-blur-xs',
      variants: {
         isOpen: {
            true: '',
            false: 'hidden',
         },
      },
   }),
   button: tv({
      base: [
         'px-primary py-[calc(var(--spacing-primary)/2)] text-14! font-medium text-neutral-50',
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

export const useStyle = {
   root: {
      wrapper: tv({
         base: 'inline-flex shrink-0 items-center justify-center p-[calc(var(--spacing-primary)/2)] text-neutral-600 bg-neutral-50 border border-utility-200 rounded-primary transition-colors cursor-pointer hover:text-neutral-950 hover:bg-neutral-100',
      }),
   },
   modal: {
      wrapper: themes.modal,
      form: 'flex flex-col w-full max-w-2xl max-h-[90vh] bg-neutral-50 border border-utility-200 rounded-secondary shadow-xl overflow-y-auto',
      header: {
         wrapper: `sticky top-0 z-10 flex items-center justify-between px-secondary py-primary bg-neutral-50 border-b border-utility-200`,
         title: 'flex items-center gap-x-primary text-neutral-950 text-18 font-semibold',
         close_button: `p-[calc(var(--spacing-primary)*3/8)] text-neutral-500 rounded-primary transition-colors cursor-pointer hover:text-neutral-900 hover:bg-neutral-100`,
         close_icon: 'size-4',
      },
      body: {
         wrapper: 'grid grid-cols-1 sm:grid-cols-2 gap-primary p-secondary',
      },
      footer: {
         wrapper: `flex items-center justify-end gap-x-[calc(var(--spacing-primary)/2)] px-secondary py-primary bg-neutral-100/50 border-t border-utility-200`,
         cancel_button: `px-primary py-[calc(var(--spacing-primary)/2)] text-neutral-700 text-13 font-medium bg-neutral-50 border border-utility-300 rounded-primary transition-colors cursor-pointer hover:bg-neutral-100`,
         save_button: themes.button,
      },
   },
};
