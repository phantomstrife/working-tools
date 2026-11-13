import { tv, cx } from 'tailwind-variants';

import css from './style.module.css';

const themes = {
   sidebar_panel: tv({
      base: [
         'fixed inset-0 right-auto flex flex-col w-72 bg-neutral-50 border-r border-utility-200 z-30',
         'transform transition-transform duration-300 ease-in-out',
         'lg:static lg:translate-x-0',
      ],
      variants: {
         isOpen: {
            true: 'translate-x-0',
            false: '-translate-x-full',
         },
      },
      defaultVariants: {
         isOpen: false,
      },
   }),
   navigation_items: tv({
      slots: {
         wrapper: `group flex items-center px-primary py-[calc(var(--spacing-primary)/2)] text-14! font-medium rounded-lg transition-colors`,
         icon: 'mr-primary size-5',
      },
      variants: {
         active: {
            true: {
               wrapper: 'bg-utility-200',
            },
            false: {
               wrapper: 'text-neutral-600 hover:bg-utility-200 hover:text-neutral-900',
               icon: 'text-neutral-400 group-hover:text-neutral-600',
            },
         },
      },
      defaultVariants: {
         active: false,
      },
   }),
};

export const useStyle = {
   root: {
      wrapper: cx('grid h-screen text-neutral-950 bg-neutral-100 overflow-hidden', css.root_wrapper),
   },
   sidebar: {
      wrapper: tv({
         base: [themes.sidebar_panel.base, css.sidebar_wrapper],
         variants: themes.sidebar_panel.variants,
         defaultVariants: themes.sidebar_panel.defaultVariants,
      }),
      header: {
         wrapper: 'flex shrink-0 items-center justify-between px-primary h-16 border-b border-utility-200',
      },
      logo: {
         wrapper: 'flex items-center gap-primary text-neutral-950 text-20 font-bold',
         text: 'flex size-8 items-center justify-center text-neutral-50 bg-neutral-950 rounded-lg',
      },
      navigation: {
         wrapper: 'flex flex-col gap-y-1 p-primary overflow-y-auto',
         title: 'mb-primary text-neutral-600 text-12 font-semibold uppercase',
         items: themes.navigation_items,
      },
   },
   fixed_header: {
      wrapper: cx(
         'sticky top-0 z-20 flex items-center justify-between gap-2 sm:gap-primary px-primary w-full h-16 border-b border-utility-200 bg-neutral-50',
         css.fixed_header_wrapper,
      ),
      left: 'flex flex-1 items-center gap-2 sm:gap-3 min-w-0',
      search: {
         wrapper: 'relative flex items-center flex-1 min-w-0 max-w-xs sm:max-w-md',
         icon: 'absolute left-3 w-4 h-4 text-neutral-500 pointer-events-none',
         input: 'py-2 pl-9 pr-3 w-full min-w-0 h-10 text-neutral-950 text-13 sm:text-14! bg-neutral-100 border border-utility-300 rounded-primary placeholder:text-neutral-400 focus:bg-neutral-50 focus:border-primary-500 transition-colors',
      },
      tool: {
         wrapper: 'flex items-center justify-end gap-1.5 sm:gap-2.5 shrink-0',
         divider: 'hidden sm:block h-6 w-px bg-utility-200',
         notify_wrapper: `relative flex items-center justify-center size-10 text-neutral-600 bg-neutral-50 rounded-full transition-colors cursor-pointer hover:text-neutral-950 hover:bg-neutral-100`,
         notify_dot: 'absolute top-2 right-2 size-2 rounded-full bg-error-600',
      },
      user: {
         wrapper: 'relative',
         trigger: tv({
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
         avatar: 'size-8 rounded-full object-cover border border-utility-300 shrink-0',
         dropdown:
            'absolute right-0 top-full mt-2 w-60 bg-neutral-50 border border-utility-200 rounded-secondary shadow-xl overflow-hidden z-40',
         dropdown_header: 'flex flex-col gap-0.5 px-primary py-3 bg-neutral-100/60 border-b border-utility-200',
         dropdown_name: 'text-13 font-bold text-neutral-950 truncate',
         dropdown_email: 'text-12 text-neutral-500 truncate',
         dropdown_role:
            'mt-1 inline-flex w-fit items-center px-2 py-0.5 text-10 font-bold uppercase tracking-wider text-primary-700 bg-primary-100 border border-primary-200 rounded-primary',
         dropdown_body: 'p-1.5',
         logout_button: tv({
            base: 'flex w-full items-center gap-x-2 px-3 py-2 text-13 font-semibold text-error-700 rounded-primary transition-colors cursor-pointer hover:bg-error-50',
            variants: {
               loading: {
                  true: 'opacity-50 pointer-events-none',
               },
            },
         }),
         logout_icon: 'size-4 shrink-0',
      },
   },
   main_content: {
      wrapper: cx('flex-1 p-primary overflow-y-auto focus:outline-none', css.main_content_wrapper),
   },
   mobile: {
      overlay: 'fixed inset-0 bg-neutral-950/25 transition-opacity z-20 lg:hidden',
      open_menu: `flex items-center justify-center size-10 text-neutral-950 rounded-primary hover:bg-neutral-100 transition-colors cursor-pointer shrink-0 lg:hidden`,
      close_menu: 'text-neutral-950 lg:hidden cursor-pointer',
   },
};
