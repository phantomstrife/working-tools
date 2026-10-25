import { tv } from 'tailwind-variants';

export const useStyle = {
   wrapper: tv({
      base: 'flex flex-col gap-y-secondary max-w-5xl mx-auto p-secondary',
   }),
   slugRow: tv({
      base: 'flex items-center gap-x-2',
   }),
   slugBtn: tv({
      base: [
         'shrink-0 px-3 py-2 text-12 font-medium text-neutral-700',
         'bg-neutral-100 border border-utility-400 rounded-primary',
         'hover:bg-neutral-200 transition-colors cursor-pointer',
      ],
   }),
   codeTextarea: tv({
      base: 'font-mono text-13',
   }),
};

