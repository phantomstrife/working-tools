import { tv } from 'tailwind-variants';

export const useStyle = {
   wrapper: tv({
      base: 'flex flex-col gap-y-secondary max-w-7xl mx-auto p-secondary',
   }),
   cell: {
      eventWrapper: tv({
         base: 'flex flex-col gap-y-0.5',
      }),
      eventNameBtn: tv({
         base: 'text-14 font-semibold text-neutral-950 hover:text-primary-600 text-left cursor-pointer',
      }),
      eventSlug: tv({
         base: 'text-12 font-mono text-neutral-500',
      }),
      venueWrapper: tv({
         base: 'flex flex-col gap-y-0.5',
      }),
      venueName: tv({
         base: 'text-13 font-medium text-neutral-900',
      }),
      venueAddress: tv({
         base: 'text-12 text-neutral-500',
      }),
      statusBadge: tv({
         base: 'inline-flex items-center px-2.5 py-0.5 text-11 font-semibold rounded-primary border',
         variants: {
            status: {
               DRAFT: 'bg-neutral-100 text-neutral-700 border-neutral-300',
               UPCOMING: 'bg-info-50 text-info-700 border-info-200',
               ONGOING: 'bg-success-50 text-success-700 border-success-200',
               COMPLETED: 'bg-primary-100 text-primary-700 border-primary-200',
               CANCELLED: 'bg-error-50 text-error-700 border-error-200',
            },
         },
         defaultVariants: {
            status: 'DRAFT',
         },
      }),
   },
   iconLg: tv({
      base: 'w-6 h-6',
   }),
};

