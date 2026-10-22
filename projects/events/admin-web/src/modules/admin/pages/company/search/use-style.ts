import { tv } from 'tailwind-variants';

export const useStyle = {
   wrapper: tv({
      base: 'flex flex-col gap-y-secondary max-w-7xl mx-auto p-secondary',
   }),
   cell: {
      companyWrapper: tv({
         base: 'flex flex-col gap-y-0.5',
      }),
      companyNameBtn: tv({
         base: 'text-14 font-semibold text-neutral-950 hover:text-primary-600 text-left cursor-pointer',
      }),
      companyMeta: tv({
         base: 'text-12 text-neutral-500',
      }),
      contactWrapper: tv({
         base: 'flex flex-col gap-y-0.5',
      }),
      contactName: tv({
         base: 'text-13 font-medium text-neutral-900',
      }),
      contactSub: tv({
         base: 'text-12 text-neutral-500',
      }),
      statusBadge: tv({
         base: 'inline-flex items-center px-2.5 py-0.5 text-11 font-semibold rounded-primary border',
         variants: {
            status: {
               ACTIVE: 'bg-success-50 text-success-700 border-success-200',
               INACTIVE: 'bg-neutral-100 text-neutral-700 border-neutral-300',
               SUSPENDED: 'bg-error-50 text-error-700 border-error-200',
            },
         },
         defaultVariants: {
            status: 'INACTIVE',
         },
      }),
   },
   iconLg: tv({
      base: 'w-6 h-6',
   }),
};
