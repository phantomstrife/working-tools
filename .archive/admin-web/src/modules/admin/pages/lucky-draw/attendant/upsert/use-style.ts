import { tv } from 'tailwind-variants';

export const useStyle = {
   wrapper: tv({
      base: 'flex flex-col gap-y-secondary max-w-5xl mx-auto p-secondary pb-20',
   }),
   checkboxRow: tv({
      base: 'flex items-center gap-x-3 p-primary bg-neutral-100/70 border border-utility-400 rounded-primary',
   }),
   checkboxInput: tv({
      base: 'w-4 h-4 rounded-primary border-utility-400 accent-neutral-900 cursor-pointer',
   }),
   checkboxContent: tv({
      base: 'flex flex-col gap-y-0.5',
   }),
   checkboxTitle: tv({
      base: 'text-13 font-semibold text-neutral-900 cursor-pointer',
   }),
   checkboxHint: tv({
      base: 'text-12 text-neutral-500',
   }),
   codeTextarea: tv({
      base: 'font-mono text-13',
   }),
};

