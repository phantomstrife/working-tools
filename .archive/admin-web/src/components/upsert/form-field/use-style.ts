import { tv } from 'tailwind-variants';

export const useStyle = {
   wrapper: tv({
      base: 'flex flex-col gap-y-1.5',
      variants: {
         fullSpan: {
            true: 'md:col-span-2',
         },
      },
   }),
   label: tv({
      base: 'text-13 font-medium text-neutral-700',
   }),
   requiredMark: tv({
      base: 'text-error-600 ml-0.5',
   }),
   input: tv({
      base: [
         'w-full px-3.5 py-2 text-14 text-neutral-950 bg-neutral-50',
         'border border-utility-400 rounded-primary transition-colors',
         'placeholder:text-neutral-400 focus:outline-none focus:border-primary-500',
      ],
      variants: {
         hasError: {
            true: 'border-error-500 focus:border-error-600 bg-error-50/30',
         },
      },
   }),
   select: tv({
      base: [
         'w-full px-3.5 py-2 text-14 text-neutral-950 bg-neutral-50',
         'border border-utility-400 rounded-primary transition-colors',
         'focus:outline-none focus:border-primary-500',
      ],
      variants: {
         hasError: {
            true: 'border-error-500 focus:border-error-600 bg-error-50/30',
         },
      },
   }),
   textarea: tv({
      base: [
         'w-full px-3.5 py-2 text-14 text-neutral-950 bg-neutral-50',
         'border border-utility-400 rounded-primary transition-colors',
         'placeholder:text-neutral-400 focus:outline-none focus:border-primary-500',
      ],
      variants: {
         hasError: {
            true: 'border-error-500 focus:border-error-600 bg-error-50/30',
         },
      },
   }),
   hint: tv({
      base: 'text-12 text-neutral-500',
   }),
   error: tv({
      base: 'text-12 font-medium text-error-600',
   }),
};

