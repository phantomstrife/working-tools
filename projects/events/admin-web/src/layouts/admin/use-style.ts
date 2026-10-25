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
         wrapper: 'group flex items-center px-primary py-2 text-14! font-medium rounded-lg transition-colors',
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
         wrapper: 'flex shrink-0 items-center justify-between px-6 h-16 border-b border-utility-200',
      },
      logo: {
         wrapper: 'flex items-center gap-primary text-neutral-950 text-20 font-bold',
         text: 'flex size-8 items-center justify-center text-neutral-50 bg-neutral-950 rounded-lg',
      },
      navigation: {
         wrapper: 'flex flex-col p-primary gap-y-1 overflow-y-auto',
         title: 'mb-primary text-neutral-600 text-12 font-semibold uppercase',
         items: themes.navigation_items,
      },
   },
   fixed_header: {
      wrapper: cx(
         'sticky top-0 flex items-center justify-between px-primary w-full h-16 border-b border-utility-200 bg-neutral-50',
         css.fixed_header_wrapper,
      ),
      search: {
         wrapper: 'relative items-center w-full max-w-md lg:max-w-xs',
         icon: 'absolute mx-3 w-4 h-full text-neutral-950 pointer-events-none',
         input: 'py-2 pl-10 pr-3 w-full text-neutral-950 text-14! bg-slate-50 border border-utility-300 rounded-md placeholder:text-neutral-400',
      },
      tool: {
         wrapper: 'flex flex-1 items-center justify-end gap-primary',
         divider: 'hidden sm:block h-6 w-px bg-slate-200',
         notify_wrapper: `relative p-3 text-neutral-600 bg-neutral-50 rounded-full transition-colors hover:text-neutral-950 hover:bg-neutral-200`,
         notify_dot: 'absolute top-2 right-2 size-2 rounded-full bg-error-600',
         account_wrapper: 'flex items-center p-2 rounded-full hover:bg-neutral-200',
         account_image: 'size-7! object-cover',
      },
   },
   main_content: {
      wrapper: cx('flex-1 p-primary overflow-y-auto focus:outline-none', css.main_content_wrapper),
   },
   mobile: {
      overlay: 'fixed inset-0 bg-neutral-950/25 transition-opacity z-20 lg:hidden',
      open_menu: `mr-4 text-neutral-950 rounded-md hover:text-slate-700 lg:hidden`,
      close_menu: 'text-neutral-950 lg:hidden',
   },
};
