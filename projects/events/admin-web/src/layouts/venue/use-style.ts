import { tv } from 'tailwind-variants';

const themes = {
   mode_button: tv({
      base: 'flex items-center gap-x-1.5 px-3 py-1.5 text-12 font-semibold rounded-primary transition-colors cursor-pointer',
      variants: {
         active: {
            true: 'bg-neutral-900 text-neutral-50 shadow-xs',
            false: 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-200/70',
         },
      },
      defaultVariants: {
         active: false,
      },
   }),
   role_badge: tv({
      base: 'px-2 py-0.5 text-11 font-semibold rounded-primary border',
      variants: {
         role: {
            SUPER_ADMIN: 'bg-primary-100 text-primary-800 border-primary-200',
            ADMIN: 'bg-info-100 text-info-800 border-info-200',
            FIELD_STAFF: 'bg-info-50 text-info-700 border-info-200',
            GUARD: 'bg-success-50 text-success-700 border-success-200',
         },
      },
      defaultVariants: {
         role: 'GUARD',
      },
   }),
   game_status_badge: tv({
      base: 'px-2 py-0.5 text-11 font-semibold rounded-primary border shrink-0',
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
      base: 'w-4 h-4 text-neutral-600',
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
      wrapper: 'flex flex-col min-h-screen bg-neutral-100 text-neutral-950',
      main: 'flex-1 w-full max-w-360 mx-auto p-secondary',
   },
   header: {
      wrapper:
         'sticky top-0 z-30 flex flex-wrap items-center justify-between gap-primary px-secondary py-3 bg-neutral-50 border-b border-utility-200 shadow-2xs',
      brand: {
         wrapper: 'flex items-center gap-x-3',
         logo: 'flex items-center justify-center w-9 h-9 bg-neutral-900 text-neutral-50 rounded-primary shadow-xs',
         title_group: 'flex flex-col',
         title: 'text-15 font-bold text-neutral-950 leading-tight',
         subtitle: 'text-12 text-neutral-500',
      },
      modes: {
         wrapper: 'flex items-center gap-x-1 p-1 bg-neutral-100 border border-utility-200 rounded-primary',
         button: themes.mode_button,
      },
      selector: {
         wrapper: 'flex flex-wrap items-center gap-x-3 gap-y-2',
         field: 'flex items-center gap-x-2 px-3 py-1.5 bg-neutral-100 border border-utility-300 rounded-primary',
         icon: 'w-4 h-4 text-neutral-500 shrink-0',
         label: 'text-11 font-semibold uppercase tracking-wider text-neutral-500 shrink-0',
         select: 'text-13 font-semibold text-neutral-950 bg-transparent cursor-pointer min-w-44 max-w-64 truncate',
         status: themes.game_status_badge,
         refresh_button:
            'flex items-center justify-center w-8 h-8 bg-neutral-100 hover:bg-neutral-200 border border-utility-300 rounded-primary transition-colors cursor-pointer',
         refresh_icon: themes.refresh_icon,
      },
      user: {
         wrapper: 'flex items-center gap-x-3',
         info: 'flex flex-col items-end',
         name_row: 'flex items-center gap-x-2',
         name: 'text-13 font-semibold text-neutral-950',
         role_badge: themes.role_badge,
         email: 'text-11 text-neutral-500',
         logout_button:
            'flex items-center gap-x-1.5 px-3 py-1.5 text-12 font-semibold text-error-700 bg-error-50 hover:bg-error-100 border border-error-200 rounded-primary transition-colors cursor-pointer',
         logout_icon: 'w-3.5 h-3.5',
      },
   },
};

