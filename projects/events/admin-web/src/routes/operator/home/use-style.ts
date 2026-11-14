import { tv } from 'tailwind-variants';

const themes = {
   submit_btn: tv({
      base: 'w-full inline-flex items-center justify-center gap-x-2 px-secondary py-2.5 text-14 font-semibold rounded-primary transition-colors cursor-pointer',
      variants: {
         disabled: {
            true: 'bg-neutral-300 text-neutral-500 cursor-not-allowed pointer-events-none',
            false: 'bg-neutral-900 text-neutral-50 hover:bg-neutral-950',
         },
      },
      defaultVariants: {
         disabled: false,
      },
   }),
};

export const useStyle = {
   root: {
      wrapper: 'flex items-center justify-center min-h-[calc(100dvh-10rem)] py-secondary',
      card: 'w-full max-w-120 flex flex-col gap-y-secondary p-secondary bg-neutral-50 border border-utility-200 rounded-secondary shadow-xs',
      header: 'flex flex-col gap-y-1',
      title: 'text-20 font-bold text-neutral-950',
      description: 'text-13 text-neutral-500',
      form: 'flex flex-col gap-y-primary',
      field: 'flex flex-col gap-y-1.5',
      label: 'flex items-center gap-x-1.5 text-12 font-semibold text-neutral-700',
      select:
         'w-full px-3 py-2.5 text-14 text-neutral-950 bg-neutral-100 border border-utility-300 rounded-primary focus:outline-none focus:border-primary-500 focus:bg-neutral-50 transition-colors cursor-pointer',
      submit: themes.submit_btn,
      empty: 'flex flex-col items-center justify-center gap-y-3 py-8 text-center',
      empty_icon: 'flex items-center justify-center w-12 h-12 bg-neutral-100 text-neutral-600 rounded-secondary',
      loading_icon: 'animate-spin',
      empty_title: 'text-16 font-bold text-neutral-950',
      empty_description: 'text-13 text-neutral-500',
   },
};
