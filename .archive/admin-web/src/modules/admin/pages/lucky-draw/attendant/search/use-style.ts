import { tv } from 'tailwind-variants';

export const useStyle = {
   wrapper: tv({
      base: 'flex flex-col gap-y-secondary max-w-7xl mx-auto p-secondary',
   }),
   iconLg: tv({
      base: 'w-5 h-5',
   }),
   cell: {
      attendantWrapper: tv({
         base: 'flex flex-col gap-y-0.5',
      }),
      nameRow: tv({
         base: 'flex items-center gap-x-2',
      }),
      nameBtn: tv({
         base: 'font-semibold text-neutral-950 hover:text-primary-600 transition-colors text-left',
      }),
      winnerBadge: tv({
         base: [
            'inline-flex items-center px-2 py-0.5 rounded-primary',
            'text-10 font-semibold tracking-wide uppercase border',
            'bg-warning-50 text-warning-700 border-warning-200',
         ],
      }),
      contactMeta: tv({
         base: 'text-12 text-neutral-500',
      }),
      ticketGroup: tv({
         base: 'flex flex-col gap-y-0.5',
      }),
      ticketBadge: tv({
         base: [
            'inline-flex items-center px-2 py-0.5 rounded-primary font-mono',
            'text-12 font-semibold bg-neutral-100 text-neutral-900 border border-utility-400 w-fit',
         ],
      }),
      qrPayload: tv({
         base: 'text-11 font-mono text-neutral-500 truncate max-w-44',
      }),
      orgGroup: tv({
         base: 'flex flex-col gap-y-0.5',
      }),
      orgCompany: tv({
         base: 'text-13 font-medium text-neutral-900',
      }),
      orgDept: tv({
         base: 'text-12 text-neutral-500',
      }),
      emailBadge: tv({
         base: 'inline-flex items-center px-2.5 py-0.5 rounded-primary text-11 font-semibold border',
         variants: {
            status: {
               NOT_SENT: 'bg-neutral-100 text-neutral-700 border-neutral-300',
               SENDING: 'bg-info-50 text-info-700 border-info-200',
               SENT: 'bg-success-50 text-success-700 border-success-200',
               FAILED: 'bg-error-50 text-error-700 border-error-200',
            },
         },
      }),
      checkInBadge: tv({
         base: 'inline-flex items-center px-2.5 py-0.5 rounded-primary text-11 font-semibold border',
         variants: {
            checkedIn: {
               true: 'bg-success-50 text-success-700 border-success-200',
               false: 'bg-neutral-100 text-neutral-600 border-neutral-300',
            },
         },
      }),
      checkInSub: tv({
         base: 'text-11 text-neutral-500 mt-0.5 block',
      }),
   },
};

