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
         },
      },
      defaultVariants: {
         variant: 'notCheckedIn',
      },
   }),
   row_action_button: tv({
      base: 'p-[calc(var(--spacing-primary)*3/8)] rounded-primary transition-colors cursor-pointer',
      variants: {
         danger: {
            true: 'text-error-600 hover:bg-error-50',
            false: 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200',
         },
      },
      defaultVariants: {
         danger: false,
      },
   }),
};

export const useStyle = {
   cell: {
      ticket_badge: `inline-flex items-center px-[calc(var(--spacing-primary)/2)] py-[calc(var(--spacing-primary)/8)] text-neutral-800 text-12 font-medium bg-neutral-100 border border-neutral-300 rounded-primary`,
      status_badge: themes.status_badge,
   },
   action: {
      wrapper: 'inline-flex items-center justify-end gap-[calc(var(--spacing-primary)*3/8)]',
      button: themes.row_action_button,
      icon: 'size-4',
   },
};
