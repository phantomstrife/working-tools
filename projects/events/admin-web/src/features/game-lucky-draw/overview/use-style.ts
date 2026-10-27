import { cx, tv } from 'tailwind-variants';

import css from './style.module.css';

const themes = {
   badge: tv({
      base: [
         'flex items-center gap-1 px-primary py-1 text-13! font-medium text-neutral-800',
         'bg-neutral-100 border border-utility-200 rounded-primary',
      ],
   }),
   icon: tv({
      base: 'text-primary-600',
      variants: {
         loading: {
            true: 'animate-spin',
         },
      },
      defaultVariants: {
         loading: false,
      },
   }),
};

export const useStyle = {
   root: {
      wrapper: 'flex flex-col gap-y-primary',
      panels_grid: 'grid grid-cols-1 xl:grid-cols-12 gap-primary items-start',
      prize_col: 'xl:col-span-7',
      staff_col: 'xl:col-span-5',
   },
   statistic: {
      wrapper: cx(
         'grid items-center justify-start gap-3 p-primary bg-neutral-50 border border-utility-300 rounded-primary shadow-xl',
         css.statistic_wrapper,
      ),
      name: cx('text-16 font-bold text-neutral-950', css.statistic_name),
      status: cx(css.statistic_status),
      prize: themes.badge({ className: css.statistic_prize }),
      staff: themes.badge({ className: css.statistic_staff }),
      tool: themes.badge({ className: css.statistic_tool }),
      icon: themes.icon,
   },
};
