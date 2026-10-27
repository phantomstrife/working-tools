import { tv } from 'tailwind-variants';

const themes = {
   status_badge: tv({
      base: 'inline-flex items-center px-[calc(var(--spacing-primary)*5/8)] h-6 rounded-primary text-11 font-medium border',
      variants: {
         variant: {
            checkedIn: 'bg-success-50 text-success-700 border-success-200',
            notCheckedIn: 'bg-neutral-100 text-neutral-500 border-neutral-200',
            winner: 'bg-warning-50 text-warning-700 border-warning-200',
            notWinner: 'bg-neutral-100 text-neutral-500 border-neutral-200',
            email_NOT_SENT: 'bg-neutral-100 text-neutral-500 border-neutral-200',
            email_SENDING: 'bg-info-50 text-info-700 border-info-200 animate-pulse',
            email_SENT: 'bg-success-50 text-success-700 border-success-200',
            email_FAILED: 'bg-error-50 text-error-700 border-error-200',
         },
      },
      defaultVariants: {
         variant: 'notCheckedIn',
      },
   }),
};

export const useStyle = {
   cell: {
      ticket_badge: `inline-flex items-center px-[calc(var(--spacing-primary)/2)] py-[calc(var(--spacing-primary)/8)] text-neutral-800 text-12 font-medium bg-neutral-100 border border-neutral-300 rounded-primary`,
      status_badge: themes.status_badge,
   },
};
