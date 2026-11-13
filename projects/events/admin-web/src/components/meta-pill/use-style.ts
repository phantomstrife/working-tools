import { tv } from 'tailwind-variants/dist/lite.cjs';

export const useStyle = {
   root: {
      wrapper: tv({
         base: [
            'inline-flex items-center max-w-full min-w-0 gap-[calc(var(--spacing-primary)/2)] px-[calc(var(--spacing-primary)/2)] py-0.5 text-14 text-neutral-500',
            'bg-neutral-100 border border-utility-200 rounded-primary',
         ],
      }),
   },
   info: {
      icon: 'size-3.5 shrink-0',
      title: 'font-medium shrink-0',
      name: 'text-neutral-950 font-semibold truncate',
   },
};
