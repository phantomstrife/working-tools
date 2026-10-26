import { tv } from 'tailwind-variants';

const themes = {
   button: tv({
      base: 'py-[calc(var(--spacing-primary)*3/4)] px-primary w-full text-neutral-50 bg-neutral-900 rounded-primary hover:bg-neutral-950 ',
      variants: {
         loading: {
            true: 'opacity-60 cursor-not-allowed',
         },
      },
      defaultVariants: {
         loading: false,
      },
   }),
};

export const useStyle = {
   root: {
      wrapper: 'flex flex-col items-center gap-y-primary',
   },
   top_block: {
      wrapper: 'flex flex-col items-center gap-y-1 text-center',
      icon: 'p-primary mb-primary bg-neutral-50 text-neutral-950 rounded-primary shadow-xl',
      header: 'text-30! font-semibold text-neutral-950',
      description: 'text-neutral-500 text-center',
   },
   form_block: {
      wrapper: 'flex flex-col gap-y-[calc(var(--spacing-primary)/2)] w-full',
      input: {
         wrapper: `flex items-center gap-x-primary w-full px-primary py-[calc(var(--spacing-primary)/2)] bg-neutral-100 border border-transparent rounded-primary`,
         field: 'w-full transition-colors placeholder-neutral-400 focus:outline-none',
      },
   },
   error_block: {
      wrapper: 'text-red-600! text-14 font-semibold',
   },
   tool_block: {
      wrapper: 'flex items-center justify-between w-full',
      button: themes.button,
   },
};
