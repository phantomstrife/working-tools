import { tv } from 'tailwind-variants';

export const useStyle = {
   wrapper: tv({
      base: [
         'flex flex-wrap items-center justify-between gap-3 px-secondary py-2.5',
         'bg-neutral-900 text-neutral-50 rounded-secondary',
      ],
   }),
   leftGroup: tv({
      base: 'flex items-center gap-x-3',
   }),
   countText: tv({
      base: 'text-13 font-semibold text-neutral-50',
   }),
   clearBtn: tv({
      base: 'text-12 text-neutral-300 hover:text-neutral-50 underline cursor-pointer',
   }),
   actions: tv({
      base: 'flex flex-wrap items-center gap-2',
   }),
   actionBtn: tv({
      base: [
         'inline-flex items-center gap-x-1.5 px-3 py-1.5 text-12 font-medium',
         'bg-neutral-800 text-neutral-100 border border-neutral-700 rounded-primary',
         'hover:bg-neutral-700 transition-colors cursor-pointer',
      ],
      variants: {
         disabled: {
            true: 'opacity-50 pointer-events-none cursor-not-allowed',
         },
      },
   }),
   dangerBtn: tv({
      base: [
         'inline-flex items-center gap-x-1.5 px-3 py-1.5 text-12 font-medium',
         'bg-error-600 text-neutral-50 rounded-primary',
         'hover:bg-error-700 transition-colors cursor-pointer',
      ],
      variants: {
         disabled: {
            true: 'opacity-50 pointer-events-none cursor-not-allowed',
         },
      },
   }),
   iconXs: tv({
      base: 'w-3.5 h-3.5',
   }),
};

