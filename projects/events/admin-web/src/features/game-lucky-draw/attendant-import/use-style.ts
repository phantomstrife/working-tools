import { tv } from 'tailwind-variants';

const themes = {
   dropzone: tv({
      base: 'flex flex-col items-center justify-center gap-[calc(var(--spacing-primary)/2)] p-secondary border-2 border-dashed rounded-secondary transition-colors cursor-pointer text-center',
      variants: {
         isDragOver: {
            true: 'border-primary-500 bg-primary-100/30',
            false: 'border-utility-300 bg-neutral-100/50 hover:border-neutral-400 hover:bg-neutral-100',
         },
      },
      defaultVariants: {
         isDragOver: false,
      },
   }),
   submit_button: tv({
      base: [
         'inline-flex items-center gap-[calc(var(--spacing-primary)*3/8)] px-primary py-[calc(var(--spacing-primary)/2)] text-13 font-semibold text-neutral-50',
         'bg-neutral-900 rounded-primary hover:bg-neutral-950 transition-colors cursor-pointer',
      ],
      variants: {
         disabled: {
            true: 'opacity-50 pointer-events-none cursor-not-allowed',
            false: '',
         },
      },
      defaultVariants: {
         disabled: false,
      },
   }),
};

export const useStyle = {
   root: 'flex flex-col',
   content: 'flex flex-col gap-primary p-secondary',
   guide: {
      wrapper: 'flex flex-wrap items-center justify-between gap-primary p-primary bg-neutral-100 border border-utility-200 rounded-primary',
      text: 'text-neutral-600 text-12',
      code: 'font-mono font-semibold text-neutral-900',
      template_button: `inline-flex items-center gap-[calc(var(--spacing-primary)*3/8)] px-[calc(var(--spacing-primary)*3/4)] py-[calc(var(--spacing-primary)*3/8)] text-12 font-semibold text-neutral-800 bg-neutral-50 border border-utility-300 rounded-primary hover:bg-neutral-200 transition-colors cursor-pointer`,
      icon: 'size-3.5',
   },
   dropzone: {
      wrapper: themes.dropzone,
      hidden_input: 'hidden',
      icon: 'size-8 text-neutral-400',
      title: 'text-neutral-800 text-14 font-semibold',
      subtitle: 'text-neutral-500 text-12',
   },
   file_bar: {
      wrapper: 'flex items-center justify-between gap-primary px-primary py-[calc(var(--spacing-primary)*5/8)] bg-neutral-100 border border-utility-200 rounded-primary',
      info: 'flex items-center gap-[calc(var(--spacing-primary)/2)] min-w-0',
      icon: 'size-4 text-primary-600 shrink-0',
      name: 'text-neutral-900 text-13 font-semibold truncate',
      count: 'text-neutral-500 text-12 shrink-0',
      remove_button: 'text-error-600 text-12 font-medium hover:underline cursor-pointer shrink-0',
   },
   preview: {
      wrapper: 'flex flex-col gap-[calc(var(--spacing-primary)/2)]',
      title: 'text-neutral-700 text-12 font-semibold uppercase',
      scroll: 'overflow-x-auto border border-utility-200 rounded-primary',
      table: 'w-full text-left border-collapse whitespace-nowrap text-12',
      th: 'px-3 py-2 bg-neutral-100 text-neutral-600 font-bold border-b border-utility-200',
      td: 'px-3 py-2 text-neutral-700 border-b border-neutral-100',
   },
   summary: {
      wrapper: 'flex flex-col gap-[calc(var(--spacing-primary)/2)] p-primary bg-warning-50 border border-warning-200 rounded-primary',
      stats: 'text-warning-900 text-13 font-semibold',
      error_list: 'max-h-36 overflow-y-auto flex flex-col gap-1 text-warning-800 text-12',
   },
   footer: {
      wrapper: `flex items-center justify-end gap-x-[calc(var(--spacing-primary)/2)] px-secondary py-primary bg-neutral-100/50 border-t border-utility-200`,
      cancel_button: `px-primary py-[calc(var(--spacing-primary)/2)] text-neutral-700 text-13 font-medium bg-neutral-50 border border-utility-300 rounded-primary transition-colors cursor-pointer hover:bg-neutral-100`,
      submit_button: themes.submit_button,
   },
};

