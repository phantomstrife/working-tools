import { tv } from 'tailwind-variants';

export const useStyle = {
   wrapper: tv({
      base: 'flex flex-col gap-y-secondary max-w-5xl mx-auto p-secondary pb-20',
   }),
   previewBox: tv({
      base: [
         'col-span-1 md:col-span-2 flex items-center gap-x-4 p-primary',
         'bg-neutral-100/60 border border-utility-400 rounded-primary',
      ],
   }),
   previewThumb: tv({
      base: [
         'w-16 h-16 rounded-primary border border-utility-400 bg-neutral-50',
         'flex items-center justify-center overflow-hidden shrink-0',
      ],
   }),
   previewImg: tv({
      base: 'w-full h-full object-cover',
   }),
   previewMeta: tv({
      base: 'flex flex-col gap-y-1',
   }),
   previewTitle: tv({
      base: 'text-13 font-semibold text-neutral-900',
   }),
   previewHint: tv({
      base: 'text-12 text-neutral-500',
   }),
};

