import { tv, cx } from 'tailwind-variants';

import css from './style.module.css';

const themes = {
   control: tv({
      base: [
         'grid grid-cols-1 px-primary h-9 text-14 text-neutral-950 bg-neutral-50 w-full min-w-0',
         'border border-utility-300 rounded-primary transition-colors',
         'placeholder:text-neutral-400 focus:outline-none focus:border-primary-500',
         '[&_input]:w-full [&_input]:min-w-0 [&_input]:bg-transparent [&_select]:w-full [&_select]:min-w-0 [&_select]:bg-transparent',
      ],
      variants: {
         error: {
            true: 'border-error-500 focus:border-error-600 bg-error-50/30',
         },
      },
      defaultVariants: {
         error: false,
      },
   }),
};

export const useStyle = {
   root: {
      wrapper: tv({
         base: ['grid gap-x-2 gap-y-1 min-w-0', css.root_wrapper],
      }),
   },
   left: {
      wrapper: cx('flex items-center gap-x-1 min-w-0', css.left_wrapper),
      icon: 'mr-1 text-neutral-500 shrink-0',
      label: 'font-medium truncate',
      required: 'text-error-600 ml-0.5 shrink-0',
   },
   right: {
      error: cx('text-12 font-medium text-error-600', css.right_error),
   },
   control: tv({
      base: [themes.control.base, css.control_wrapper],
      variants: themes.control.variants,
   }),
   bottom: {
      hint: cx('mt-1 text-12 text-neutral-500', css.bottom_hint),
   },
};
