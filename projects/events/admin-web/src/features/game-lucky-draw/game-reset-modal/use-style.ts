import { tv } from 'tailwind-variants';

import { modalFormStyle } from '@admin-web/components/modal/form-style';

const themes = {
   checkbox_card: tv({
      base: 'flex items-start gap-x-2.5 px-primary py-2.5 bg-neutral-50 border border-utility-300 rounded-primary transition-colors',
      variants: {
         disabled: {
            true: 'opacity-50 cursor-not-allowed bg-neutral-100',
            false: 'cursor-pointer hover:bg-neutral-100/60',
         },
         selected: {
            true: 'border-primary-400 bg-primary-100/40',
            false: '',
         },
         locked: {
            true: 'cursor-default border-primary-400 bg-primary-100/40',
            false: '',
         },
         danger: {
            true: 'border-error-200 bg-error-50/40 hover:bg-error-50',
            false: '',
         },
      },
      defaultVariants: {
         disabled: false,
         selected: false,
         locked: false,
         danger: false,
      },
   }),
   submit_danger_button: tv({
      base: [
         'inline-flex items-center justify-center gap-x-1.5 px-primary py-[calc(var(--spacing-primary)/2)]',
         'text-13 font-semibold text-neutral-50 bg-error-600 rounded-primary hover:bg-error-700',
         'transition-colors cursor-pointer',
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
   form: modalFormStyle.form,
   body: 'flex flex-col gap-y-primary p-primary sm:p-secondary',
   game_box: 'flex items-center justify-between gap-2 px-primary py-2 bg-neutral-100 border border-utility-200 rounded-primary',
   game_label: 'text-12 font-medium text-neutral-500',
   game_name: 'text-13 font-bold text-neutral-950 truncate',
   scope: {
      list: 'flex flex-col gap-y-1.5 pt-1.5 text-12 text-neutral-700',
      item: 'flex items-start gap-x-2',
      item_preserve: 'flex items-start gap-x-2 font-semibold text-success-700',
      dot: 'mt-1.5 size-1.5 rounded-full bg-neutral-500 shrink-0',
      dot_preserve: 'mt-1.5 size-1.5 rounded-full bg-success-600 shrink-0',
   },
   options: {
      wrapper: 'flex flex-col gap-y-2',
      title: 'text-12 font-bold uppercase tracking-wider text-neutral-700',
      card: themes.checkbox_card,
      checkbox_primary: 'mt-0.5 size-4 accent-primary-600 rounded cursor-pointer shrink-0',
      checkbox: 'mt-0.5 size-4 accent-error-600 rounded cursor-pointer shrink-0',
      content: 'flex flex-col gap-y-0.5 min-w-0',
      label: 'text-13 font-semibold text-neutral-900 select-none',
      label_danger: 'text-13 font-semibold text-error-700 select-none',
      hint: 'text-12 text-neutral-500 select-none',
   },
   warning: {
      box: 'flex items-start gap-x-2.5 p-primary bg-error-50 border border-error-200 rounded-primary text-error-700',
      icon: 'shrink-0 mt-0.5 text-error-600',
      text: 'text-12 font-medium leading-relaxed',
   },
   footer: {
      wrapper: modalFormStyle.footer.wrapper,
      cancel_button: modalFormStyle.footer.cancel_button,
      submit_button: themes.submit_danger_button,
   },
};
