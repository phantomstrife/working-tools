import { tv, cx } from 'tailwind-variants';

import css from './style.module.css';

const themes = {
   control: tv({
      base: [
         'grid grid-cols-1 px-primary h-9 text-14 text-neutral-950 bg-neutral-50',
         'border border-utility-300 rounded-primary transition-colors',
         'placeholder:text-neutral-400 focus:outline-none focus:border-primary-500',
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
         base: ['grid gap-y-1', css.root_wrapper],
      }),
   },
   left_block: {
      wrapper: cx('flex items-center gap-x-1', css.left_block_wrapper),
      icon: 'mr-1 text-neutral-500',
      label: 'font-medium',
      required: 'text-error-600 ml-0.5',
   },
   right_block: {
      error: cx('text-12 font-medium text-error-600', css.right_block_error),
   },
   control: tv({
      base: [themes.control.base, css.control_wrapper],
      variants: themes.control.variants,
   }),
   bottom_block: {
      hint: cx('mt-1 text-12 text-neutral-500', css.bottom_block_hint),
   },
};
