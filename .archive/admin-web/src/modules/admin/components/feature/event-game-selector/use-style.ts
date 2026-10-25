import { tv } from 'tailwind-variants';

export const useStyle = {
   wrapper: tv({
      base: 'grid grid-cols-1 md:grid-cols-2 gap-primary bg-neutral-50 border border-utility-400 rounded-secondary p-secondary shadow-xs',
   }),
   fieldGroup: tv({
      base: 'flex flex-col gap-y-1.5',
   }),
   labelRow: tv({
      base: 'flex items-center justify-between',
   }),
   label: tv({
      base: 'flex items-center gap-x-1.5 text-13 font-semibold text-neutral-800',
   }),
   countBadge: tv({
      base: 'text-11 font-medium text-neutral-500',
   }),
   select: tv({
      base: [
         'w-full px-3.5 py-2.5 text-14 font-medium text-neutral-950 bg-neutral-50',
         'border border-utility-400 rounded-primary transition-colors cursor-pointer',
         'focus:outline-none focus:border-primary-500',
      ],
      variants: {
         disabled: {
            true: 'opacity-50 bg-neutral-100 cursor-not-allowed pointer-events-none',
         },
      },
   }),
   helperText: tv({
      base: 'text-12 text-neutral-500',
   }),
   iconSm: tv({
      base: 'w-4 h-4 text-neutral-500 shrink-0',
   }),
};

