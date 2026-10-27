import { modalFormStyle } from '@admin-web/components/modal/form-style';

export const useStyle = {
   ...modalFormStyle,
   qr_box: {
      wrapper: `mx-secondary mb-secondary flex items-center justify-between gap-primary px-primary py-[calc(var(--spacing-primary)*5/8)] bg-neutral-100 border border-utility-200 rounded-primary`,
      info: 'flex flex-col gap-[2px] min-w-0',
      label: 'text-neutral-500 text-11 font-semibold uppercase',
      value: 'text-neutral-800 text-12 font-mono truncate',
      copy_button: 'shrink-0 p-[calc(var(--spacing-primary)*3/8)] rounded-primary hover:bg-neutral-200 cursor-pointer',
   },
};
