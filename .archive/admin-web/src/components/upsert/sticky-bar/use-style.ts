import { tv } from 'tailwind-variants';

export const useStyle = {
   wrapper: tv({
      base: [
         'sticky top-0 z-20 flex items-center justify-between gap-x-primary',
         'px-secondary py-primary bg-neutral-50/90 backdrop-blur-md',
         'border-b border-utility-400 rounded-secondary',
      ],
   }),
   leftGroup: tv({
      base: 'flex items-center gap-x-3',
   }),
   backBtn: tv({
      base: [
         'inline-flex items-center justify-center p-2 text-neutral-600',
         'bg-neutral-50 border border-utility-400 rounded-primary',
         'hover:bg-neutral-100 hover:text-neutral-950 transition-colors cursor-pointer',
      ],
   }),
   titleGroup: tv({
      base: 'flex flex-col',
   }),
   title: tv({
      base: 'text-20 font-semibold text-neutral-950',
   }),
   subtitle: tv({
      base: 'text-12 text-neutral-500',
   }),
   actions: tv({
      base: 'flex items-center gap-x-2',
   }),
   dirtyBadge: tv({
      base: [
         'px-2.5 py-1 text-12 font-medium text-warning-700',
         'bg-warning-50 border border-warning-200 rounded-primary',
      ],
   }),
   cancelBtn: tv({
      base: [
         'px-primary py-2 text-14 font-medium text-neutral-700',
         'bg-neutral-50 border border-utility-400 rounded-primary',
         'hover:bg-neutral-100 transition-colors cursor-pointer',
      ],
   }),
   saveBtn: tv({
      base: [
         'inline-flex items-center gap-x-2 px-primary py-2 text-14 font-medium text-neutral-50',
         'bg-neutral-900 rounded-primary hover:bg-neutral-950 transition-colors cursor-pointer',
      ],
      variants: {
         disabled: {
            true: 'opacity-50 cursor-not-allowed pointer-events-none',
         },
      },
   }),
   iconSm: tv({
      base: 'w-4 h-4',
   }),
   iconSpin: tv({
      base: 'w-4 h-4 animate-spin',
   }),
};

