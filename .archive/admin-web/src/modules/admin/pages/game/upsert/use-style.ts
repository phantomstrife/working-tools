import { tv } from 'tailwind-variants';

export const useStyle = {
   wrapper: tv({
      base: 'flex flex-col gap-y-secondary max-w-5xl mx-auto p-secondary',
   }),
   checkboxRow: tv({
      base: [
         'flex items-start gap-x-3 p-3.5 bg-neutral-100/70',
         'border border-utility-400 rounded-primary',
      ],
   }),
   checkboxInput: tv({
      base: 'w-4 h-4 mt-0.5 rounded-primary border-utility-400 text-neutral-900 cursor-pointer',
   }),
   checkboxContent: tv({
      base: 'flex flex-col gap-y-0.5',
   }),
   checkboxTitle: tv({
      base: 'text-13 font-semibold text-neutral-950 cursor-pointer',
   }),
   checkboxHint: tv({
      base: 'text-12 text-neutral-500',
   }),
   staffGrid: tv({
      base: 'md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3',
   }),
   staffCard: tv({
      base: [
         'flex items-center justify-between gap-x-3 p-3 bg-neutral-50',
         'border border-utility-400 rounded-primary transition-colors cursor-pointer hover:bg-neutral-100/60',
      ],
      variants: {
         selected: {
            true: 'border-primary-500 bg-primary-100/20',
         },
      },
   }),
   staffLeft: tv({
      base: 'flex items-center gap-x-3',
   }),
   staffInfo: tv({
      base: 'flex flex-col',
   }),
   staffName: tv({
      base: 'text-13 font-semibold text-neutral-950',
   }),
   staffEmail: tv({
      base: 'text-12 text-neutral-500',
   }),
   roleBadge: tv({
      base: 'inline-flex items-center px-2 py-0.5 text-10 font-semibold rounded-primary border',
      variants: {
         role: {
            FIELD_STAFF: 'bg-info-50 text-info-700 border-info-200',
            GUARD: 'bg-warning-50 text-warning-700 border-warning-200',
         },
      },
      defaultVariants: {
         role: 'FIELD_STAFF',
      },
   }),
   emptyStaffNote: tv({
      base: 'md:col-span-2 p-primary text-13 text-neutral-500 bg-neutral-100 border border-utility-400 rounded-primary text-center',
   }),
   codeTextarea: tv({
      base: 'font-mono text-13',
   }),
};

