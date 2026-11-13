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
      base: 'mt-1 inline-flex w-fit items-center px-2 py-0.5 text-10 font-bold uppercase tracking-wider rounded-primary border',
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
   user_trigger: tv({
      base: 'flex items-center justify-center p-1 rounded-full border transition-colors cursor-pointer',
      variants: {
         isOpen: {
            true: 'bg-neutral-100 border-utility-300 ring-2 ring-primary-500/20',
            false: 'bg-transparent border-transparent hover:bg-neutral-100 hover:border-utility-200',
         },
      },
      defaultVariants: {
         isOpen: false,
      },
   }),
};

export const useStyle = {
   root: {
      wrapper: 'flex flex-col min-h-screen bg-neutral-100 text-neutral-950',
      main: 'flex-1 w-full max-w-360 mx-auto p-primary sm:p-secondary',
   },
   header: {
      wrapper:
         'sticky top-0 z-30 flex items-center justify-between gap-2 sm:gap-primary px-primary sm:px-secondary h-16 bg-neutral-50 border-b border-utility-200 shadow-2xs',
      brand: {
         wrapper: 'flex items-center gap-x-2.5 sm:gap-x-3 min-w-0',
         logo: 'flex items-center justify-center w-9 h-9 bg-neutral-900 text-neutral-50 rounded-primary shadow-xs shrink-0',
         title_group: 'flex flex-col min-w-0',
         title: 'text-14 sm:text-15 font-bold text-neutral-950 leading-tight truncate',
         subtitle: 'text-11 sm:text-12 text-neutral-500 truncate',
      },
      right: 'flex items-center gap-2 sm:gap-3 shrink-0',
      modes: {
         wrapper: 'hidden md:flex items-center gap-1 p-1 bg-neutral-100 border border-utility-200 rounded-primary',
         button: themes.mode_button,
      },
      user: {
         wrapper: 'relative',
         trigger: themes.user_trigger,
         avatar: 'size-8 rounded-full object-cover border border-utility-300 shrink-0',
         dropdown:
            'absolute right-0 top-full mt-2 w-60 bg-neutral-50 border border-utility-200 rounded-secondary shadow-xl overflow-hidden z-40',
         dropdown_header: 'flex flex-col gap-0.5 px-primary py-3 bg-neutral-100/60 border-b border-utility-200',
         dropdown_name: 'text-13 font-bold text-neutral-950 truncate',
         dropdown_email: 'text-12 text-neutral-500 truncate',
         dropdown_role: themes.role_badge,
         dropdown_modes: 'flex md:hidden flex-col gap-0.5 p-1.5 border-b border-utility-200',
         dropdown_mode_btn: tv({
            base: 'flex w-full items-center gap-x-2 px-3 py-2 text-13 font-semibold rounded-primary transition-colors cursor-pointer',
            variants: {
               active: {
                  true: 'bg-neutral-900 text-neutral-50',
                  false: 'text-neutral-700 hover:bg-neutral-100',
               },
            },
            defaultVariants: {
               active: false,
            },
         }),
         dropdown_body: 'p-1.5',
         logout_button:
            'flex w-full items-center gap-x-2 px-3 py-2 text-13 font-semibold text-error-700 rounded-primary transition-colors cursor-pointer hover:bg-error-50',
         logout_icon: 'size-4 shrink-0',
      },
   },
};

