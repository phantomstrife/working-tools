import { tv } from 'tailwind-variants';

export const useStyle = {
   root: {
      wrapper: 'flex flex-col gap-y-primary w-full',
   },
   status: {
      wrapper: 'flex flex-col items-center text-center gap-y-3 py-primary',
      icon_box: tv({
         base: 'flex items-center justify-center w-14 h-14 rounded-full border',
         variants: {
            tone: {
               loading: 'bg-primary-100/60 text-primary-600 border-primary-200',
               success: 'bg-success-50 text-success-600 border-success-200',
               error: 'bg-error-50 text-error-600 border-error-200',
               edit: 'bg-neutral-100 text-neutral-900 border-utility-200',
            },
         },
      }),
      spinner: 'animate-spin',
      title: 'text-20 sm:text-24 font-bold text-neutral-950 leading-tight',
      description: 'text-14 text-neutral-600 leading-relaxed max-w-md',
   },
   event_meta: {
      wrapper: 'flex flex-wrap items-center justify-center gap-2 pt-1',
      event_pill:
         'inline-flex items-center px-2.5 py-1 text-12 font-medium text-neutral-700 bg-neutral-100 border border-utility-200 rounded-full',
      ticket_pill:
         'inline-flex items-center px-2.5 py-1 text-12 font-mono font-bold text-primary-700 bg-primary-100/70 border border-primary-200 rounded-full',
   },
   summary_card: {
      wrapper: 'flex flex-col gap-y-3 p-primary bg-neutral-50 border border-utility-200 rounded-primary',
      heading: 'text-12 font-semibold uppercase tracking-wide text-neutral-500',
      list: 'flex flex-col divide-y divide-utility-200',
      row: 'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 py-2.5 first:pt-0 last:pb-0',
      label: 'text-13 text-neutral-500 font-medium',
      value: 'text-14 font-semibold text-neutral-900 break-words',
   },
   form: {
      header: 'flex flex-col items-center text-center gap-y-2 pb-1',
      wrapper: 'flex flex-col gap-y-primary w-full',
      fields: 'flex flex-col gap-y-3.5',
      error_banner:
         'px-primary py-2.5 text-13 font-medium text-error-700 bg-error-50 border border-error-200 rounded-primary',
      footer: 'flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5 pt-2',
   },
   actions: {
      confirm_footer: 'flex justify-center pt-1',
      expired_notice:
         'text-13 font-medium text-warning-700 bg-warning-50 border border-warning-200 rounded-primary px-primary py-2 text-center w-full',
      primary_btn: tv({
         base: [
            'inline-flex items-center justify-center gap-x-2 px-secondary py-2.5 rounded-primary',
            'text-14 font-semibold text-neutral-50 bg-neutral-900 hover:bg-neutral-950 transition-colors cursor-pointer',
            'w-full sm:w-auto',
         ],
         variants: {
            disabled: {
               true: 'opacity-60 cursor-not-allowed hover:bg-neutral-900',
            },
         },
      }),
      secondary_btn: [
         'inline-flex items-center justify-center gap-x-2 px-primary py-2.5 rounded-primary',
         'text-14 font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 border border-utility-200 transition-colors cursor-pointer',
         'w-full sm:w-auto',
      ].join(' '),
   },
};
