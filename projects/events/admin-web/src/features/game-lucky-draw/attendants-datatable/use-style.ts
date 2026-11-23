import { tv } from 'tailwind-variants';

const themes = {
   status_badge: tv({
      base: 'inline-flex items-center px-[calc(var(--spacing-primary)*5/8)] h-6 rounded-primary text-11 font-medium border',
      variants: {
         variant: {
            checkedIn: 'bg-success-50 text-success-700 border-success-200',
            notCheckedIn: 'bg-neutral-100 text-neutral-500 border-neutral-200',
            winner: 'bg-warning-50 text-warning-700 border-warning-200',
            absent: 'bg-error-50 text-error-700 border-error-200',
            notWinner: 'bg-neutral-100 text-neutral-500 border-neutral-200',
            email_NOT_SENT: 'bg-neutral-100 text-neutral-500 border-neutral-200',
            email_SENDING: 'bg-info-50 text-info-700 border-info-200 animate-pulse',
            email_SENT: 'bg-success-50 text-success-700 border-success-200',
            email_FAILED: 'bg-error-50 text-error-700 border-error-200',
            accommodation_true: 'bg-warning-50 text-warning-700 border-warning-200',
            accommodation_false: 'bg-neutral-100 text-neutral-500 border-neutral-200',
         },
      },
      defaultVariants: {
         variant: 'notCheckedIn',
      },
   }),
   eligibility_switch: tv({
      base: 'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/40 cursor-pointer',
      variants: {
         checked: {
            true: 'bg-success-600',
            false: 'bg-neutral-300',
         },
         pending: {
            true: 'opacity-50 pointer-events-none cursor-wait',
            false: '',
         },
      },
      defaultVariants: {
         checked: true,
         pending: false,
      },
   }),
   eligibility_thumb: tv({
      base: 'pointer-events-none inline-block size-4 rounded-full bg-neutral-50 shadow-xs transition-transform',
      variants: {
         checked: {
            true: 'translate-x-4',
            false: 'translate-x-0.5',
         },
      },
      defaultVariants: {
         checked: true,
      },
   }),
};

export const useStyle = {
   cell: {
      ticket_badge: `inline-flex items-center px-[calc(var(--spacing-primary)/2)] py-[calc(var(--spacing-primary)/8)] text-neutral-800 text-12 font-medium bg-neutral-100 border border-neutral-300 rounded-primary`,
      status_badge: themes.status_badge,
      eligibility_switch: themes.eligibility_switch,
      eligibility_thumb: themes.eligibility_thumb,
   },
};
