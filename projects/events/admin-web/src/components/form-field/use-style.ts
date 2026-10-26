import { tv } from 'tailwind-variants';

const themes = {
   control: tv({
      base: [
         'grid grid-cols-1 px-primary py-2 text-14 text-neutral-950 bg-neutral-50',
         'border border-utility-300 rounded-primary transition-colors',
         'placeholder:text-neutral-400 focus:outline-none focus:border-primary-500',
      ],
      variants: {
         hasError: {
            true: 'border-error-500 focus:border-error-600 bg-error-50/30',
         },
      },
   }),
};

export const useStyle = {
   root: {
      wrapper: tv({
         base: 'flex flex-col gap-y-1.5',
      }),
   },
   header: {
      wrapper: 'text-13 font-medium text-neutral-700',
      required: 'text-error-600 ml-0.5',
   },
   control: themes.control,
   footer: {
      hint: 'text-12 text-neutral-500',
      error: 'text-12 font-medium text-error-600',
   },
};
