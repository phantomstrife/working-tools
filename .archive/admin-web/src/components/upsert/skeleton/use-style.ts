import { tv } from 'tailwind-variants';

export const useStyle = {
   skeletonWrapper: tv({
      base: 'flex flex-col gap-y-secondary max-w-5xl mx-auto p-secondary',
   }),
   skeletonBar: tv({
      base: 'h-16 w-full bg-neutral-200 animate-pulse rounded-secondary',
   }),
   skeletonCard: tv({
      base: 'h-64 w-full bg-neutral-200 animate-pulse rounded-secondary',
   }),
   errorBanner: tv({
      base: [
         'flex items-center justify-between gap-x-primary p-primary',
         'bg-error-50 border border-error-200 rounded-secondary text-14 text-error-700 font-medium',
      ],
   }),
};

