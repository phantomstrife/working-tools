import { tv } from 'tailwind-variants';

import styles from './style.module.css';

import type * as Types from './type';

const themes = {
   container: tv({
      base: 'fixed inset-0 flex items-center justify-center p-primary bg-neutral-950/60 backdrop-blur-xs overflow-y-auto ',
      variants: {
         isOpen: {
            true: 'z-50 opacity-100 pointer-events-auto',
            false: '-z-10 opacity-0 pointer-events-none',
         },
      },
   }),
   wrapper: tv({
      base: 'relative flex flex-col max-w-full max-h-[90vh] bg-neutral-50 border border-utility-200 shadow-xl overflow-hidden transition-all duration-300',
      variants: {
         isOpen: {
            true: 'scale-100 opacity-100',
            false: 'scale-95 opacity-0',
         },
      },
   }),
   header: tv({
      base: 'flex items-start justify-between gap-primary px-secondary py-primary bg-neutral-50 border-b border-utility-200',
   }),
   close: tv({
      base: 'shrink-0 p-[calc(var(--spacing-primary)*3/8)] text-neutral-500 rounded-primary transition-colors cursor-pointer hover:text-neutral-900 hover:bg-neutral-100',
   }),
   body: tv({
      base: 'flex-1 overflow-y-auto',
      variants: {
         isOpen: {
            true: 'modal-instance block',
            false: 'hidden',
         },
      },
   }),
   footer: tv({
      base: 'flex items-center justify-end gap-x-[calc(var(--spacing-primary)/2)] px-secondary py-primary bg-neutral-100/50 border-t border-utility-200',
   }),
};

export function useStyle(properties: Types.Properties, state: Types.State) {
   const { style = {} } = properties;

   const {
      className,
      bodyClass = 'p-secondary',
      closeButtonClass,
      headerClass,
      footerClass,
      radius = 'rounded-secondary',
      width = '40rem',
   } = style;

   const isOpen = state.status === 'open';

   return {
      style: {
         main: {
            container: themes.container({ isOpen }),
            wrapper: themes.wrapper({
               isOpen,
               className: [radius, styles.main_wrapper, className].filter(Boolean).join(' '),
            }),
         },
         modal: {
            header: {
               wrapper: themes.header({ className: headerClass }),
               content: 'flex flex-col gap-[calc(var(--spacing-primary)/4)] min-w-0',
               title: 'flex items-center gap-x-primary text-neutral-950 text-18 font-semibold empty:hidden',
               description: 'text-neutral-500 text-13',
               close: themes.close({ className: closeButtonClass }),
               close_icon: 'size-4',
            },
            body: themes.body({ isOpen, className: bodyClass }),
            footer: themes.footer({ className: footerClass }),
         },
      },
      variable: {
         '--mWidth': width,
      } as React.CSSProperties,
   };
}
