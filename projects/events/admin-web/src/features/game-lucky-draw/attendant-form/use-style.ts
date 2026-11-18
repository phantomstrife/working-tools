import { tv } from 'tailwind-variants';

import { modalFormStyle } from '@admin-web/components/modal/form-style';

const themes = {
   tab_btn: tv({
      base: 'inline-flex items-center gap-x-1.5 px-primary py-2 text-13 font-semibold border-b-2 -mb-px transition-colors cursor-pointer',
      variants: {
         active: {
            true: 'border-neutral-900 text-neutral-950',
            false: 'border-transparent text-neutral-500 hover:text-neutral-800',
         },
      },
      defaultVariants: {
         active: false,
      },
   }),
   action_badge: tv({
      base: 'inline-flex items-center gap-x-1 px-2 py-0.5 text-11 font-bold uppercase tracking-wider rounded-primary border',
      variants: {
         action: {
            ATTENDANT_GUARD_EDIT: 'bg-info-50 text-info-700 border-info-200',
            ATTENDANT_SELF_SERVICE_UPDATE: 'bg-warning-50 text-warning-700 border-warning-200',
            ATTENDANT_SELF_SERVICE_CONFIRM: 'bg-success-50 text-success-700 border-success-200',
         },
      },
   }),
   refresh_icon: tv({
      base: 'w-3.5 h-3.5 shrink-0',
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
   ...modalFormStyle,
   tabs: {
      wrapper: 'flex items-center gap-x-2 px-primary sm:px-secondary pt-2 bg-neutral-100/40 border-b border-utility-200',
      button: themes.tab_btn,
      count_badge:
         'px-1.5 py-0.5 text-10 font-bold tabular-nums bg-neutral-200 text-neutral-700 rounded-full leading-none',
   },
   checkbox_field: {
      wrapper: 'sm:col-span-2 flex flex-col gap-y-1',
      title_row: 'flex items-center gap-x-1.5 text-13 font-medium text-neutral-800',
      title_icon: 'text-neutral-500 shrink-0',
      control:
         'flex items-center gap-x-2.5 px-primary py-2.5 bg-neutral-50 border border-utility-300 rounded-primary cursor-pointer hover:bg-neutral-100/60 transition-colors',
      input: 'w-4 h-4 accent-neutral-900 rounded cursor-pointer shrink-0',
      label: 'text-13 text-neutral-700 select-none',
   },
   qr_box: {
      wrapper: `mx-primary sm:mx-secondary mb-primary sm:mb-secondary flex items-center justify-between gap-primary px-primary py-[calc(var(--spacing-primary)*5/8)] bg-neutral-100 border border-utility-200 rounded-primary`,
      info: 'flex flex-col gap-[2px] min-w-0',
      label: 'text-neutral-500 text-11 font-semibold uppercase',
      value: 'text-neutral-800 text-12 font-mono truncate',
      copy_button: 'shrink-0 p-[calc(var(--spacing-primary)*3/8)] rounded-primary hover:bg-neutral-200 cursor-pointer',
   },
   history: {
      wrapper: 'flex flex-col gap-y-3 p-primary sm:p-secondary',
      toolbar: 'flex items-center justify-between gap-2',
      summary: 'text-12 text-neutral-500 font-medium',
      refresh_btn:
         'inline-flex items-center gap-x-1.5 px-2.5 py-1 text-11 font-semibold text-neutral-700 bg-neutral-50 hover:bg-neutral-100 border border-utility-300 rounded-primary transition-colors cursor-pointer',
      refresh_icon: themes.refresh_icon,
      list: 'flex flex-col gap-y-2.5 max-h-96 overflow-y-auto pr-1',
      empty:
         'flex flex-col items-center justify-center gap-y-2 py-12 px-secondary text-center text-13 text-neutral-500 bg-neutral-100/60 border border-dashed border-utility-300 rounded-secondary',
      error:
         'p-primary text-13 font-medium text-error-700 bg-error-50 border border-error-200 rounded-primary',
      card: 'flex flex-col gap-y-2.5 p-primary bg-neutral-50 border border-utility-200 rounded-primary',
      card_header: 'flex flex-wrap items-center justify-between gap-2',
      badge_group: 'flex flex-wrap items-center gap-1.5',
      action_badge: themes.action_badge,
      source_pill:
         'px-2 py-0.5 text-11 font-medium text-neutral-600 bg-neutral-100 border border-utility-200 rounded-primary',
      timestamp: 'text-11 font-mono text-neutral-500 shrink-0',
      actor: 'flex items-center gap-x-1.5 text-12 text-neutral-600',
      actor_name: 'font-semibold text-neutral-800',
      confirm_note: 'text-12 text-success-700 bg-success-50/70 border border-success-200 px-2.5 py-1.5 rounded-primary',
      diff_list: 'flex flex-col gap-y-1.5 pt-2 border-t border-utility-200',
      diff_row: 'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-12',
      diff_field: 'font-semibold text-neutral-700 shrink-0',
      diff_values: 'flex flex-wrap items-center gap-1.5 min-w-0',
      diff_from:
         'px-1.5 py-0.5 text-12 text-error-700 bg-error-50 border border-error-200 rounded-primary line-through break-all',
      diff_arrow: 'text-neutral-400 shrink-0',
      diff_to:
         'px-1.5 py-0.5 text-12 font-semibold text-success-700 bg-success-50 border border-success-200 rounded-primary break-all',
   },
};
