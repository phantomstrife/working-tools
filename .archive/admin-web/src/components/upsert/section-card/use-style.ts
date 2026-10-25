import { tv } from 'tailwind-variants';

export const useStyle = {
   wrapper: tv({
      base: 'bg-neutral-50 border border-utility-400 rounded-secondary p-secondary shadow-xs',
   }),
   header: tv({
      base: 'flex flex-col gap-y-0.5 pb-3 mb-primary border-b border-neutral-200',
   }),
   title: tv({
      base: 'text-16 font-semibold text-neutral-950',
   }),
   description: tv({
      base: 'text-13 text-neutral-500',
   }),
   grid: tv({
      base: 'grid grid-cols-1 md:grid-cols-2 gap-primary',
   }),
};

