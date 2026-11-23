import { tv } from 'tailwind-variants';

import { modalFormStyle } from '@admin-web/components/modal/form-style';

const themes = {
   rank_badge: tv({
      base: 'inline-flex items-center justify-center min-w-8 px-1.5 py-0.5 rounded-primary text-11 font-bold tabular-nums border shrink-0',
      variants: {
         top: {
            true: 'bg-warning-100 text-warning-800 border-warning-300',
            false: 'bg-primary-100 text-primary-800 border-primary-200',
         },
      },
      defaultVariants: {
         top: false,
      },
   }),
   status_pill: tv({
      base: 'inline-flex items-center px-2 py-0.5 rounded-primary text-10 font-semibold border whitespace-nowrap shrink-0',
      variants: {
         status: {
            ELIGIBLE: 'bg-success-50 text-success-700 border-success-200',
            NOT_CHECKED_IN: 'bg-warning-50 text-warning-700 border-warning-200',
            HAS_WON: 'bg-neutral-100 text-neutral-600 border-neutral-300',
            ABSENT: 'bg-error-50 text-error-700 border-error-200',
            INELIGIBLE: 'bg-error-50 text-error-700 border-error-200',
            MISSING: 'bg-error-50 text-error-700 border-error-200',
         },
      },
      defaultVariants: {
         status: 'ELIGIBLE',
      },
   }),
   order_button: tv({
      base: 'inline-flex items-center justify-center size-6 rounded-primary border border-utility-300 bg-neutral-50 text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer shrink-0',
      variants: {
         disabled: {
            true: 'opacity-40 pointer-events-none cursor-not-allowed',
            false: '',
         },
      },
      defaultVariants: {
         disabled: false,
      },
   }),
};

export const useStyle = {
   ...modalFormStyle,
   designated: {
      section: 'sm:col-span-2 flex flex-col gap-y-2.5 pt-2 border-t border-utility-200',
      header: 'flex flex-wrap items-center justify-between gap-2',
      title_row: 'flex items-center gap-x-1.5 text-13 font-semibold text-neutral-900',
      title_icon: 'text-primary-600 shrink-0',
      count_badge:
         'inline-flex items-center px-2 py-0.5 rounded-full text-11 font-semibold bg-info-50 text-info-700 border border-info-200',
      clear_all_button:
         'text-12 font-medium text-error-600 hover:text-error-700 hover:underline transition-colors cursor-pointer',
      helper: 'text-12 text-neutral-500 leading-relaxed',
      empty:
         'px-primary py-3 text-12 text-neutral-500 bg-neutral-100/70 border border-dashed border-utility-300 rounded-primary',
      ranked_list: 'max-h-56 overflow-y-auto flex flex-col gap-1.5 pr-0.5',
      ranked_item:
         'flex items-center justify-between gap-2 px-2.5 py-2 bg-neutral-50 border border-utility-300 rounded-primary',
      item_main: 'flex items-center gap-2 min-w-0 flex-1',
      rank_badge: themes.rank_badge,
      ticket_pill:
         'inline-flex items-center px-1.5 py-0.5 rounded-primary text-11 font-semibold font-mono bg-neutral-100 text-neutral-800 border border-neutral-300 shrink-0',
      guest_info: 'flex flex-col min-w-0 flex-1',
      guest_name_row: 'flex flex-wrap items-center gap-x-1.5 gap-y-0.5 min-w-0',
      guest_name: 'text-13 font-semibold text-neutral-900 truncate',
      guest_meta: 'text-11 text-neutral-500 truncate',
      status_pill: themes.status_pill,
      controls: 'flex items-center gap-1 shrink-0',
      order_button: themes.order_button,
      remove_button:
         'inline-flex items-center justify-center size-6 rounded-primary border border-error-200 bg-error-50 text-error-700 hover:bg-error-100 transition-colors cursor-pointer shrink-0',
      picker_wrapper: 'flex flex-col gap-y-2',
      search_box:
         'relative flex items-center bg-neutral-50 border border-utility-300 rounded-primary focus-within:border-primary-500 transition-colors',
      search_icon: 'ml-2.5 text-neutral-400 shrink-0',
      search_input: 'w-full px-2 py-2 text-13 text-neutral-900 placeholder:text-neutral-400 bg-transparent',
      search_clear:
         'mr-1.5 inline-flex items-center justify-center size-6 rounded-primary text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer shrink-0',
      search_prompt:
         'px-primary py-3 text-12 text-neutral-500 text-center bg-neutral-100/60 border border-dashed border-utility-300 rounded-primary',
      results_list:
         'max-h-44 overflow-y-auto flex flex-col divide-y divide-utility-200 border border-utility-300 rounded-primary bg-neutral-50',
      results_state: 'flex items-center justify-center gap-x-2 py-4 px-primary text-12 text-neutral-500',
      results_error: 'py-3 px-primary text-12 font-medium text-error-700 bg-error-50',
      result_row:
         'w-full flex items-center justify-between gap-2 px-2.5 py-2 text-left hover:bg-primary-100/40 transition-colors cursor-pointer',
      add_icon_wrap:
         'inline-flex items-center justify-center size-6 rounded-primary bg-primary-100 text-primary-700 border border-primary-200 shrink-0',
      spinner: 'size-3.5 animate-spin shrink-0',
   },
};
