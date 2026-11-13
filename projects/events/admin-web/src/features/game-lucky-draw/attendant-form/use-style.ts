import { modalFormStyle } from '@admin-web/components/modal/form-style';

export const useStyle = {
   ...modalFormStyle,
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
};
