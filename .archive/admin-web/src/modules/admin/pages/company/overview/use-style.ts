import { tv } from 'tailwind-variants';

export const useStyle = {
   // wrapper: tv({
   //    base: 'flex flex-col gap-y-secondary max-w-7xl mx-auto p-secondary pb-20',
   // }),
   // headerBlock: tv({
   //    base: 'flex flex-col gap-y-1',
   // }),
   // pageTitle: tv({
   //    base: 'text-24 font-semibold text-neutral-950 tracking-tight',
   // }),
   // pageSubtitle: tv({
   //    base: 'text-14 text-neutral-500',
   // }),
   skeletonCard: tv({
      base: 'h-44 bg-neutral-100 border border-utility-400 rounded-secondary animate-pulse',
   }),
   skeletonSelector: tv({
      base: 'h-28 bg-neutral-100 border border-utility-400 rounded-secondary animate-pulse',
   }),
   emptyStateBox: tv({
      base: [
         'flex flex-col items-center justify-center py-16 px-secondary text-center gap-y-3',
         'bg-neutral-50 border border-utility-400 rounded-secondary shadow-xs',
      ],
   }),
   emptyIconBox: tv({
      base: [
         'w-12 h-12 rounded-secondary bg-neutral-100 border border-utility-400',
         'flex items-center justify-center text-neutral-500',
      ],
   }),
   emptyTitle: tv({
      base: 'text-16 font-semibold text-neutral-950',
   }),
   emptyDescription: tv({
      base: 'text-13 text-neutral-500 max-w-md',
   }),
   iconLg: tv({
      base: 'w-5 h-5',
   }),
};
