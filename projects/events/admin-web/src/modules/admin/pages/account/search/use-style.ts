import { tv } from 'tailwind-variants';

export const useStyle = {
   wrapper: tv({
      base: 'flex flex-col gap-y-secondary max-w-7xl mx-auto p-secondary',
   }),
   cell: {
      accountWrapper: tv({
         base: 'flex flex-col gap-y-0.5',
      }),
      accountNameBtn: tv({
         base: 'text-14 font-semibold text-neutral-950 hover:text-primary-600 text-left cursor-pointer',
      }),
      accountSub: tv({
         base: 'text-12 text-neutral-500',
      }),
      roleBadge: tv({
         base: 'inline-flex items-center px-2.5 py-0.5 text-11 font-semibold rounded-primary border',
         variants: {
            role: {
               SUPER_ADMIN: 'bg-question-50 text-question-700 border-question-200',
               ADMIN: 'bg-primary-100 text-primary-700 border-primary-200',
               FIELD_STAFF: 'bg-info-50 text-info-700 border-info-200',
               GUARD: 'bg-warning-50 text-warning-700 border-warning-200',
            },
         },
         defaultVariants: {
            role: 'FIELD_STAFF',
         },
      }),
      statusBadge: tv({
         base: 'inline-flex items-center px-2.5 py-0.5 text-11 font-semibold rounded-primary border',
         variants: {
            active: {
               true: 'bg-success-50 text-success-700 border-success-200',
               false: 'bg-neutral-100 text-neutral-600 border-neutral-300',
            },
         },
         defaultVariants: {
            active: true,
         },
      }),
   },
   iconLg: tv({
      base: 'w-6 h-6',
   }),
};

