import { tv } from 'tailwind-variants';

export const useStyle = {
   wrapper: tv({
      base: [
         'flex flex-col gap-y-3 p-primary bg-neutral-50',
         'border border-utility-400 rounded-secondary',
      ],
   }),
   controlsRow: tv({
      base: 'flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3',
   }),
   searchBox: tv({
      base: 'relative flex items-center flex-1 max-w-md',
   }),
   searchIcon: tv({
      base: 'w-4 h-4 text-neutral-400 absolute left-3 pointer-events-none',
   }),
   searchInput: tv({
      base: [
         'w-full pl-9 pr-8 py-2 text-13 text-neutral-950 bg-neutral-50',
         'border border-utility-400 rounded-primary transition-colors',
         'placeholder:text-neutral-400 focus:outline-none focus:border-primary-500',
      ],
   }),
   clearSearchBtn: tv({
      base: 'absolute right-2.5 text-neutral-400 hover:text-neutral-700 cursor-pointer',
   }),
   filterGroup: tv({
      base: 'flex flex-wrap items-center gap-2',
   }),
   select: tv({
      base: [
         'px-3 py-2 text-13 text-neutral-800 bg-neutral-50',
         'border border-utility-400 rounded-primary focus:outline-none focus:border-primary-500',
      ],
   }),
   sortOrderBtn: tv({
      base: [
         'inline-flex items-center gap-x-1.5 px-3 py-2 text-13 font-medium text-neutral-700',
         'bg-neutral-50 border border-utility-400 rounded-primary',
         'hover:bg-neutral-100 transition-colors cursor-pointer',
      ],
   }),
   chipsRow: tv({
      base: 'flex flex-wrap items-center gap-2 pt-2 border-t border-neutral-200',
   }),
   chip: tv({
      base: [
         'inline-flex items-center gap-x-1.5 px-2.5 py-1 text-12 font-medium',
         'bg-neutral-100 text-neutral-800 border border-utility-400 rounded-primary',
      ],
   }),
   chipRemoveBtn: tv({
      base: 'text-neutral-500 hover:text-neutral-950 cursor-pointer',
   }),
   clearAllBtn: tv({
      base: 'text-12 font-medium text-primary-600 hover:text-primary-800 underline cursor-pointer ml-1',
   }),
   iconXs: tv({
      base: 'w-3.5 h-3.5',
   }),
};

