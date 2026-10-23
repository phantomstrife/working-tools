import { tv } from 'tailwind-variants';

export const useStyle = {
   page: tv({
      base: 'min-h-screen w-full flex items-center justify-center bg-neutral-950 p-primary',
   }),
   formCard: tv({
      base: [
         'w-full max-w-sm flex flex-col gap-4 p-secondary rounded-secondary',
         'bg-neutral-900 border border-neutral-800 shadow-2xl text-neutral-50',
      ],
   }),
   headerBlock: tv({
      base: 'flex flex-col gap-1',
   }),
   badge: tv({
      base: [
         'self-start px-2.5 py-0.5 rounded-primary text-10 font-bold uppercase tracking-wider',
         'bg-warning-950 text-warning-400 border border-warning-800',
      ],
   }),
   title: tv({
      base: 'text-20 font-bold text-neutral-50 mt-1',
   }),
   subtitle: tv({
      base: 'text-12 text-neutral-400',
   }),
   label: tv({
      base: 'flex flex-col gap-1.5 text-13 font-medium text-neutral-300',
   }),
   input: tv({
      base: [
         'px-3 py-2.5 rounded-primary bg-neutral-950 border border-neutral-700',
         'text-13 text-neutral-50 focus:outline-none focus:border-warning-500 transition-colors',
      ],
   }),
   errorText: tv({
      base: 'px-3 py-2 rounded-primary bg-error-950/80 border border-error-800 text-12 text-error-300',
   }),
   submitBtn: tv({
      base: [
         'px-4 py-2.5 rounded-primary bg-warning-500 hover:bg-warning-400',
         'text-13 text-neutral-950 font-bold tracking-wide transition-colors cursor-pointer',
      ],
      variants: {
         disabled: {
            true: 'opacity-60 pointer-events-none cursor-not-allowed',
         },
      },
   }),
};

