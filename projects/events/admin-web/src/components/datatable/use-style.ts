import { tv } from 'tailwind-variants';

const themes = {
   button: tv({
      base: 'inline-flex items-center gap-[calc(var(--spacing-primary)*3/8)] py-[calc(var(--spacing-primary)*3/8)] text-13 font-semibold rounded-primary shadow-sm transition-colors cursor-pointer',
      variants: {
         variant: {
            primary: 'px-[calc(var(--spacing-primary)*7/8)] text-neutral-50 bg-neutral-900 hover:bg-neutral-950',
            secondary:
               'px-[calc(var(--spacing-primary)*3/4)] text-neutral-800 bg-neutral-50 border border-utility-300 hover:bg-neutral-100',
         },
         disabled: {
            true: 'opacity-50 pointer-events-none cursor-not-allowed',
            false: '',
         },
      },
      defaultVariants: {
         variant: 'secondary',
         disabled: false,
      },
   }),
   table_th: tv({
      base: 'px-[calc(var(--spacing-primary)*5/4)] py-[calc(var(--spacing-primary)*3/4)] text-neutral-600 text-11 font-bold uppercase',
      variants: {
         align: {
            left: 'text-left',
            center: 'text-center',
            right: 'text-right',
         },
      },
      defaultVariants: {
         align: 'left',
      },
   }),
   table_tr: tv({
      base: 'transition-colors hover:bg-neutral-100/60',
      variants: {
         selected: {
            true: 'bg-primary-100/30 hover:bg-primary-100/50',
            false: '',
         },
      },
      defaultVariants: {
         selected: false,
      },
   }),
   table_td: tv({
      base: 'align-middle px-[calc(var(--spacing-primary)*5/4)] h-12',
      variants: {
         align: {
            left: 'text-left',
            center: 'text-center',
            right: 'text-right',
         },
         emphasis: {
            true: 'text-neutral-900 text-14 font-semibold',
            false: 'text-neutral-600 text-13',
         },
      },
      defaultVariants: {
         align: 'left',
         emphasis: false,
      },
   }),
   checkbox: tv({
      base: 'size-4 rounded-sm border-utility-300 accent-neutral-900 cursor-pointer',
      variants: {
         disabled: {
            true: 'opacity-40 cursor-not-allowed pointer-events-none',
            false: '',
         },
      },
      defaultVariants: {
         disabled: false,
      },
   }),
   page_button: tv({
      base: 'p-[calc(var(--spacing-primary)*3/8)] rounded-primary border border-utility-300 bg-neutral-50 transition-colors',
      variants: {
         disabled: {
            true: 'text-neutral-400 cursor-not-allowed pointer-events-none',
            false: 'text-neutral-700 hover:bg-neutral-100 cursor-pointer',
         },
      },
      defaultVariants: {
         disabled: false,
      },
   }),
};

export const useStyle = {
   root: {
      wrapper: tv({
         base: 'flex flex-col bg-neutral-50 border border-utility-300 rounded-secondary shadow-sm overflow-hidden',
      }),
   },
   header: {
      wrapper: `flex flex-wrap items-center justify-between gap-primary px-[calc(var(--spacing-primary)*5/4)] py-primary bg-neutral-100/30 border-b border-utility-300`,
      title: {
         wrapper: 'flex flex-wrap items-center gap-[calc(var(--spacing-primary)*5/8)]',
         text: 'text-neutral-900 text-16 font-bold',
         badge: 'inline-flex items-center px-[calc(var(--spacing-primary)/2)] h-6 text-neutral-700 text-12 font-semibold bg-neutral-200 rounded-primary',
         selected_badge: `inline-flex items-center gap-[calc(var(--spacing-primary)/4)] px-[calc(var(--spacing-primary)/2)] h-6 text-primary-700 text-12 font-semibold bg-primary-100 border border-primary-200 rounded-primary`,
         clear_button: 'inline-flex items-center text-primary-700 hover:text-primary-950 cursor-pointer',
         clear_icon: 'size-3.5',
      },
      tools: {
         wrapper: 'flex flex-wrap items-center gap-[calc(var(--spacing-primary)/2)]',
         button: themes.button,
         icon: 'size-4',
         label: 'text-13',
      },
   },
   toolbar: {
      wrapper: `flex items-center px-[calc(var(--spacing-primary)*5/4)] py-primary bg-neutral-50 border-b border-utility-300`,
      search: {
         wrapper: 'relative flex-1 min-w-0',
         icon: 'absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-neutral-400 pointer-events-none',
         input: 'pl-[calc(var(--spacing-primary)*2.5)] pr-[calc(var(--spacing-primary)*2)] w-full h-10 text-neutral-950 text-13 bg-neutral-100 border border-utility-300 rounded-primary transition-all focus:outline-none focus:border-primary-500 focus:bg-neutral-50 focus:ring-2 focus:ring-primary-500/20',
      },
      filter: {
         wrapper: 'flex items-center gap-[calc(var(--spacing-primary)*3/4)]',
         select: `px-[calc(var(--spacing-primary)*3/4)] ml-primary h-10 text-13 font-medium bg-neutral-50 border border-utility-300 rounded-primary appearance-none cursor-pointer focus:outline-none`,
      },
   },
   table: {
      scroll_wrapper: tv({
         base: 'overflow-x-auto',
         variants: {
            compact: {
               true: 'min-h-135',
               false: 'min-h-135',
            },
         },
         defaultVariants: {
            compact: false,
         },
      }),
      wrapper: 'w-full text-left border-collapse whitespace-nowrap',
      head: {
         wrapper: 'sticky top-0 z-10 bg-neutral-100 border-b border-utility-300',
         th: themes.table_th,
         checkbox_th:
            'w-11 pl-[calc(var(--spacing-primary)*5/4)] pr-2 py-[calc(var(--spacing-primary)*3/4)] align-middle',
      },
      body: {
         wrapper: 'divide-y divide-neutral-200',
         tr: themes.table_tr,
         td: themes.table_td,
         checkbox_td: 'w-11 pl-[calc(var(--spacing-primary)*5/4)] pr-2 h-12 align-middle',
      },
      checkbox: themes.checkbox,
      checkbox_skeleton: 'size-4 bg-neutral-200 rounded-[4px] animate-pulse',
      skeleton: 'w-3/4 h-4 bg-neutral-200 rounded-primary animate-pulse',
      empty_state: tv({
         base: 'text-center align-middle',
         variants: {
            compact: {
               true: 'py-20 text-14 text-neutral-500 font-medium',
               false: 'pt-75 text-18! text-neutral-950 font-semibold',
            },
         },
         defaultVariants: {
            compact: false,
         },
      }),
   },
   pagination: {
      wrapper: `flex flex-wrap items-center justify-between px-[calc(var(--spacing-primary)*5/4)] py-[calc(var(--spacing-primary)*3/4)] bg-neutral-100/60 border-t border-utility-300`,
      summary: 'text-neutral-500 text-13',
      control: {
         wrapper: `flex items-center gap-[calc(var(--spacing-primary)*3/4)] mt-[calc(var(--spacing-primary)*3/4)] sm:mt-0`,
         limit_select: `px-[calc(var(--spacing-primary)*3/4)] py-[calc(var(--spacing-primary)*3/8)] text-12 font-medium bg-neutral-50 border border-utility-300 rounded-primary appearance-none cursor-pointer focus:outline-none`,
         nav_wrapper: 'flex items-center gap-[calc(var(--spacing-primary)/4)]',
         page_button: themes.page_button,
         page_indicator: 'px-[calc(var(--spacing-primary)/2)] text-neutral-800 text-12 font-semibold',
         icon: 'size-4',
      },
   },
};
