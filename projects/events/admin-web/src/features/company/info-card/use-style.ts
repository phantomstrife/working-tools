import { cx, tv } from 'tailwind-variants';

import css from './style.module.css';

const themes = {
   accent_bar: tv({
      base: 'w-full h-1.5 bg-linear-to-r',
      variants: {
         status: {
            ACTIVE: 'from-success-600 via-success-400 to-success-500',
            INACTIVE: 'from-error-600 via-error-400 to-error-500',
            SUSPENDED: 'from-neutral-600 via-neutral-400 to-neutral-500',
         },
      },
      defaultVariants: {
         status: 'ACTIVE',
      },
   }),
   icon_tone: tv({
      base: 'flex items-center justify-center size-14 rounded-primary transition-colors duration-200',
      variants: {
         tone: {
            primary: 'bg-primary-100 text-primary-600 group-hover:bg-primary-600 group-hover:text-neutral-50',
            info: 'bg-info-50 text-info-600 group-hover:bg-info-600 group-hover:text-neutral-50',
            success: 'bg-success-50 text-success-600 group-hover:bg-success-600 group-hover:text-neutral-50',
            warning: 'bg-warning-50 text-warning-600 group-hover:bg-warning-600 group-hover:text-neutral-50',
         },
      },
      defaultVariants: {
         tone: 'primary',
      },
   }),
   detail_value: tv({
      base: 'flex items-center gap-x-primary text-14 truncate',
      variants: {
         isEmpty: {
            true: 'text-neutral-400 italic font-normal',
            false: 'text-neutral-950 font-medium',
         },
      },
      defaultVariants: {
         isEmpty: false,
      },
   }),
};

export const useStyle = {
   root: {
      wrapper: `relative overflow-hidden rounded-primary bg-neutral-50 border border-utility-200 shadow-sm transition-all duration-200`,
      accent_bar: themes.accent_bar,
   },
   header: {
      wrapper: cx(
         'relative grid items-center justify-start justify-items-start gap-x-primary p-[calc(var(--spacing-primary)*2)] border-b border-utility-200',
         css.header_wrapper,
      ),
      logo: {
         wrapper: cx(
            'group relative flex size-30 shrink-0 items-center justify-center rounded-primary bg-linear-to-br from-neutral-50 to-neutral-100 border border-utility-200 shadow-inner overflow-hidden',
            css.header_logo_wrapper,
         ),
         image: 'w-full h-full object-cover transition-transform duration-300 group-hover:scale-105',
         icon: 'size-6 text-neutral-400',
      },
      name: cx('text-28 font-medium tracking-tight text-neutral-950 truncate', css.header_name),
      badge: css.header_status,
      industry: css.header_industry,
      tax: css.header_tax,
      action: `absolute top-4 right-4`,
   },
   body: {
      wrapper: 'grid grid-cols-2 gap-primary p-[calc(var(--spacing-primary)*2)]',
      item: {
         wrapper: `group relative flex items-start gap-primary min-w-0 p-primary bg-neutral-50 border border-utility-200 rounded-primary shadow-2xs transition-all duration-150 hover:border-primary-200 hover:shadow-sm`,
         icon: themes.icon_tone,
      },
      content: {
         wrapper: 'flex flex-col justify-center h-full',
         label: 'flex items-center justify-between mb-1 text-neutral-600/50 text-12 font-semibold uppercase',
         value: themes.detail_value,
      },
   },
};
