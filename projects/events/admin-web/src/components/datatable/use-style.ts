import { tv } from 'tailwind-variants';

const themes = {
   //
};

// header_button: tv({
//       base: 'inline-flex items-center gap-[calc(var(--spacing-primary)*3/8)] py-[calc(var(--spacing-primary)*3/8)] text-13 font-semibold rounded-primary shadow-sm transition-colors cursor-pointer',
//       variants: {
//          variant: {
//             primary: 'px-[calc(var(--spacing-primary)*7/8)] text-neutral-50 bg-neutral-900 hover:bg-neutral-950',
//             secondary:
//                'px-[calc(var(--spacing-primary)*3/4)] text-neutral-800 bg-neutral-50 border border-utility-300 hover:bg-neutral-100',
//          },
//          disabled: {
//             true: 'opacity-50 pointer-events-none cursor-not-allowed',
//             false: '',
//          },
//       },
//       defaultVariants: {
//          variant: 'secondary',
//          disabled: false,
//       },
//    }),
//    table_th: tv({
//       base: 'px-[calc(var(--spacing-primary)*5/4)] py-[calc(var(--spacing-primary)*3/4)] text-neutral-600 text-11 font-bold uppercase tracking-wider',
//       variants: {
//          align: {
//             left: 'text-left',
//             center: 'text-center',
//             right: 'text-right',
//          },
//       },
//       defaultVariants: {
//          align: 'left',
//       },
//    }),
//    table_td: tv({
//       base: 'px-[calc(var(--spacing-primary)*5/4)] py-[calc(var(--spacing-primary)*3/4)] align-middle',
//       variants: {
//          align: {
//             left: 'text-left',
//             center: 'text-center',
//             right: 'text-right',
//          },
//          emphasis: {
//             true: 'text-neutral-900 text-14 font-semibold',
//             false: 'text-neutral-600 text-13',
//          },
//       },
//       defaultVariants: {
//          align: 'left',
//          emphasis: false,
//       },
//    }),
//    row_action_button: tv({
//       base: 'p-[calc(var(--spacing-primary)*3/8)] rounded-primary transition-colors cursor-pointer',
//       variants: {
//          danger: {
//             true: 'text-error-600 hover:bg-error-50',
//             false: 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200',
//          },
//          disabled: {
//             true: 'opacity-40 pointer-events-none cursor-not-allowed',
//             false: '',
//          },
//       },
//       defaultVariants: {
//          danger: false,
//          disabled: false,
//       },
//    }),
//    page_button: tv({
//       base: 'p-[calc(var(--spacing-primary)*3/8)] rounded-primary border border-utility-300 bg-neutral-50 transition-colors',
//       variants: {
//          disabled: {
//             true: 'text-neutral-400 cursor-not-allowed pointer-events-none',
//             false: 'text-neutral-700 hover:bg-neutral-100 cursor-pointer',
//          },
//       },
//       defaultVariants: {
//          disabled: false,
//       },
//    }),

export const useStyle = {
   root: {
      wrapper: 'flex flex-col bg-neutral-50 border border-utility-300 rounded-secondary shadow-sm overflow-hidden',
   },
};

// header: {
//       wrapper:
//          'flex flex-wrap items-center justify-between gap-primary px-[calc(var(--spacing-primary)*5/4)] py-primary bg-neutral-100/30 border-b border-neutral-200',
//       title: {
//          wrapper: 'flex items-center gap-[calc(var(--spacing-primary)*5/8)]',
//          text: 'text-neutral-900 text-16 font-bold',
//          badge: 'inline-flex items-center px-[calc(var(--spacing-primary)/2)] py-[calc(var(--spacing-primary)/8)] text-neutral-700 text-12 font-semibold bg-neutral-200 rounded-md',
//       },
//       action: {
//          wrapper: 'flex flex-wrap items-center gap-[calc(var(--spacing-primary)/2)]',
//          button: themes.header_button,
//          icon: 'size-4',
//          label_responsive: 'hidden sm:inline',
//       },
//    },
//    toolbar: {
//       wrapper:
//          'flex flex-col sm:flex-row sm:items-center gap-[calc(var(--spacing-primary)*3/4)] px-[calc(var(--spacing-primary)*5/4)] py-primary bg-neutral-50 border-b border-neutral-200',
//       search: {
//          wrapper: 'relative flex-1 min-w-0',
//          icon: 'absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-neutral-400 pointer-events-none',
//          input: 'pl-[calc(var(--spacing-primary)*2.5)] pr-[calc(var(--spacing-primary)*2)] py-[calc(var(--spacing-primary)/2)] w-full text-neutral-900 text-13 bg-neutral-100 border border-utility-300 rounded-primary transition-all focus:outline-none focus:border-primary-500 focus:bg-neutral-50 focus:ring-2 focus:ring-primary-500/20',
//          clear_button:
//             'absolute right-2.5 top-1/2 -translate-y-1/2 p-[calc(var(--spacing-primary)/4)] text-neutral-400 cursor-pointer hover:text-neutral-700',
//          clear_icon: 'size-4',
//       },
//       filter_select:
//          'px-[calc(var(--spacing-primary)*7/8)] py-[calc(var(--spacing-primary)/2)] sm:w-48 text-neutral-800 text-13 font-medium bg-neutral-100 border border-utility-300 rounded-primary transition-colors cursor-pointer hover:border-neutral-400 focus:outline-none focus:border-primary-500',
//    },
//    table: {
//       scroll_wrapper: 'min-h-[300px] overflow-x-auto',
//       wrapper: 'w-full text-left border-collapse whitespace-nowrap',
//       head: {
//          wrapper: 'sticky top-0 z-10 bg-neutral-100 border-b border-utility-300',
//          th: themes.table_th,
//       },
//       body: {
//          wrapper: 'divide-y divide-neutral-200',
//          empty_state:
//             'px-[calc(var(--spacing-primary)*5/4)] py-[calc(var(--spacing-primary)*3)] text-center text-neutral-500 text-14',
//          tr: 'transition-colors hover:bg-neutral-100/60',
//          td: themes.table_td,
//          skeleton: 'w-3/4 h-4 bg-neutral-200 rounded-primary animate-pulse',
//       },
//       action: {
//          wrapper: 'inline-flex items-center justify-end gap-[calc(var(--spacing-primary)*3/8)]',
//          button: themes.row_action_button,
//          icon: 'size-4',
//       },
//    },
//    pagination: {
//       wrapper:
//          'flex flex-col sm:flex-row sm:items-center sm:justify-between px-[calc(var(--spacing-primary)*5/4)] py-[calc(var(--spacing-primary)*3/4)] bg-neutral-100/60 border-t border-utility-300',
//       summary: 'text-neutral-500 text-13',
//       control: {
//          wrapper:
//             'flex items-center gap-[calc(var(--spacing-primary)*3/4)] mt-[calc(var(--spacing-primary)*3/4)] sm:mt-0',
//          limit_select:
//             'px-[calc(var(--spacing-primary)*3/4)] py-[calc(var(--spacing-primary)*3/8)] text-12 font-medium bg-neutral-50 border border-utility-300 rounded-primary appearance-none cursor-pointer focus:outline-none',
//          nav_wrapper: 'flex items-center gap-[calc(var(--spacing-primary)/4)]',
//          page_button: themes.page_button,
//          page_indicator: 'px-[calc(var(--spacing-primary)/2)] text-neutral-800 text-12 font-semibold',
//          icon: 'size-4',
//       },
//    },
