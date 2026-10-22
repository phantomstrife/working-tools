import { tv } from 'tailwind-variants';

export const useStyle = {
   wrapper: tv({
      base: 'flex flex-col md:flex-row md:items-center md:justify-between gap-primary',
   }),
   titleGroup: tv({
      base: 'flex flex-col gap-y-1',
   }),
   title: tv({
      base: 'text-24 font-semibold text-neutral-950 tracking-tight',
   }),
   subtitle: tv({
      base: 'text-14 text-neutral-500',
   }),
   actions: tv({
      base: 'flex flex-wrap items-center gap-x-2 gap-y-2',
   }),
   hiddenInput: tv({
      base: 'hidden',
   }),
   secondaryBtn: tv({
      base: [
         'inline-flex items-center gap-x-2 px-primary py-2 text-13 font-medium text-neutral-800',
         'bg-neutral-50 border border-utility-400 rounded-primary',
         'hover:bg-neutral-100 transition-colors cursor-pointer',
      ],
      variants: {
         disabled: {
            true: 'opacity-50 pointer-events-none cursor-not-allowed',
         },
      },
   }),
   primaryBtn: tv({
      base: [
         'inline-flex items-center gap-x-2 px-primary py-2 text-13 font-medium text-neutral-50',
         'bg-neutral-900 rounded-primary hover:bg-neutral-950 transition-colors cursor-pointer',
      ],
   }),
   icon: tv({
      base: 'w-4 h-4',
   }),
};

