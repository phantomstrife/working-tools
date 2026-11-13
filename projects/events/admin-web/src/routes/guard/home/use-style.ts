import { tv } from 'tailwind-variants';

const themes = {
   game_status_badge: tv({
      base: 'px-2.5 py-0.5 text-11 font-bold uppercase tracking-wider rounded-primary border shrink-0',
      variants: {
         status: {
            PENDING: 'bg-neutral-100 text-neutral-600 border-utility-300',
            READY: 'bg-info-50 text-info-700 border-info-200',
            LIVE: 'bg-success-50 text-success-700 border-success-200',
            FINISHED: 'bg-warning-50 text-warning-700 border-warning-200',
         },
      },
      defaultVariants: {
         status: 'READY',
      },
   }),
   refresh_icon: tv({
      base: 'w-4 h-4 text-neutral-600 shrink-0',
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
      wrapper: 'flex flex-col gap-y-secondary',
   },
   selector: {
      wrapper:
         'flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 p-3 sm:p-primary bg-neutral-50 border border-utility-200 rounded-secondary shadow-2xs',
      fields: 'grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 flex-1 min-w-0',
      field:
         'flex items-center gap-x-2.5 px-3 py-2 bg-neutral-100 border border-utility-300 rounded-primary min-w-0 focus-within:border-primary-500 focus-within:bg-neutral-50 transition-colors',
      icon: 'w-4 h-4 text-neutral-500 shrink-0',
      label: 'text-11 font-semibold uppercase tracking-wider text-neutral-500 shrink-0',
      select:
         'flex-1 text-13 font-semibold text-neutral-950 bg-transparent cursor-pointer min-w-0 truncate',
      actions: 'flex items-center justify-between sm:justify-end gap-2 shrink-0',
      status: themes.game_status_badge,
      refresh_button:
         'inline-flex items-center justify-center gap-x-1.5 px-3 py-2 text-12 font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 border border-utility-300 rounded-primary transition-colors cursor-pointer shrink-0',
      refresh_icon: themes.refresh_icon,
   },
   empty: {
      wrapper:
         'flex flex-col items-center justify-center gap-y-3 py-20 px-secondary text-center bg-neutral-50 border border-utility-200 rounded-secondary shadow-2xs',
      icon: 'flex items-center justify-center w-12 h-12 bg-neutral-100 text-neutral-600 rounded-secondary',
      loading_icon: 'animate-spin',
      title: 'text-18 font-bold text-neutral-950',
      description: 'max-w-120 text-13 text-neutral-500',
   },
};
