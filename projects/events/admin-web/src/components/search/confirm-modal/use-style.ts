import { tv } from 'tailwind-variants';

export const useStyle = {
   backdrop: tv({
      base: 'fixed inset-0 z-50 flex items-center justify-center p-primary bg-neutral-950/50 backdrop-blur-xs',
   }),
   dialog: tv({
      base: [
         'w-full max-w-md p-secondary bg-neutral-50',
         'border border-utility-400 rounded-secondary shadow-xl flex flex-col gap-y-primary',
      ],
   }),
   header: tv({
      base: 'flex items-start gap-x-3',
   }),
   dangerIconBox: tv({
      base: 'p-2.5 bg-error-50 text-error-600 border border-error-200 rounded-secondary shrink-0',
   }),
   titleGroup: tv({
      base: 'flex flex-col gap-y-1',
   }),
   title: tv({
      base: 'text-16 font-semibold text-neutral-950',
   }),
   description: tv({
      base: 'text-13 text-neutral-600',
   }),
   highlight: tv({
      base: 'font-semibold text-neutral-950',
   }),
   footer: tv({
      base: 'flex items-center justify-end gap-x-2 pt-2 border-t border-neutral-200',
   }),
   cancelBtn: tv({
      base: [
         'px-primary py-2 text-13 font-medium text-neutral-700',
         'bg-neutral-50 border border-utility-400 rounded-primary',
         'hover:bg-neutral-100 transition-colors cursor-pointer',
      ],
   }),
   confirmDeleteBtn: tv({
      base: [
         'inline-flex items-center gap-x-2 px-primary py-2 text-13 font-medium text-neutral-50',
         'bg-error-600 rounded-primary hover:bg-error-700 transition-colors cursor-pointer',
      ],
      variants: {
         disabled: {
            true: 'opacity-50 pointer-events-none cursor-not-allowed',
         },
      },
   }),
   iconMd: tv({
      base: 'w-5 h-5',
   }),
   iconSpin: tv({
      base: 'w-4 h-4 animate-spin',
   }),
};

