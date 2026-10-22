import { tv } from 'tailwind-variants';

export const useStyle = {
   wrapper: tv({
      base: [
         'grid grid-cols-1 md:grid-cols-3 gap-primary p-primary',
         'bg-neutral-100 border border-utility-400 rounded-secondary',
      ],
   }),
   item: tv({
      base: 'flex flex-col gap-y-0.5',
   }),
   label: tv({
      base: 'text-11 font-medium uppercase tracking-wider text-neutral-500',
   }),
   value: tv({
      base: 'text-13 font-mono text-neutral-800 break-all',
   }),
};

