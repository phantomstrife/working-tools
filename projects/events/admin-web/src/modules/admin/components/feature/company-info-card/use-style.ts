import { tv } from 'tailwind-variants';

export const useStyle = {
   card: tv({
      base: 'bg-neutral-50 border border-utility-400 rounded-secondary p-secondary shadow-xs flex flex-col gap-y-primary',
   }),
   topRow: tv({
      base: 'flex flex-col gap-y-3 sm:flex-row sm:items-start sm:justify-between pb-primary border-b border-neutral-200',
   }),
   identityGroup: tv({
      base: 'flex items-center gap-x-4 min-w-0',
   }),
   logoBox: tv({
      base: [
         'w-14 h-14 rounded-secondary border border-utility-400 bg-neutral-100',
         'flex items-center justify-center overflow-hidden shrink-0 text-neutral-500',
      ],
   }),
   logoImg: tv({
      base: 'w-full h-full object-cover',
   }),
   titleGroup: tv({
      base: 'flex flex-col gap-y-1 min-w-0',
   }),
   titleRow: tv({
      base: 'flex flex-wrap items-center gap-x-2.5 gap-y-1',
   }),
   companyName: tv({
      base: 'text-20 font-semibold text-neutral-950 truncate',
   }),
   statusBadge: tv({
      base: 'inline-flex items-center px-2.5 py-0.5 rounded-primary text-11 font-semibold uppercase tracking-wide border',
      variants: {
         status: {
            ACTIVE: 'bg-success-50 text-success-700 border-success-200',
            INACTIVE: 'bg-neutral-100 text-neutral-700 border-neutral-300',
            SUSPENDED: 'bg-error-50 text-error-700 border-error-200',
         },
      },
   }),
   subMetaRow: tv({
      base: 'flex flex-wrap items-center gap-x-3 gap-y-1 text-13 text-neutral-500',
   }),
   actionsGroup: tv({
      base: 'flex flex-wrap items-center gap-x-2.5 shrink-0',
   }),
   companySwitcher: tv({
      base: [
         'px-3 py-2 text-13 font-medium text-neutral-900 bg-neutral-50',
         'border border-utility-400 rounded-primary focus:outline-none focus:border-primary-500 cursor-pointer',
      ],
   }),
   updateBtn: tv({
      base: [
         'inline-flex items-center gap-x-2 px-primary py-2 text-13 font-medium text-neutral-50',
         'bg-neutral-900 rounded-primary hover:bg-neutral-950 transition-colors cursor-pointer',
      ],
   }),
   detailsGrid: tv({
      base: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-primary',
   }),
   detailItem: tv({
      base: 'flex flex-col gap-y-1 p-3 bg-neutral-100/50 border border-neutral-200 rounded-primary min-w-0',
   }),
   detailLabel: tv({
      base: 'flex items-center gap-x-1.5 text-11 font-semibold uppercase tracking-wider text-neutral-500',
   }),
   detailValue: tv({
      base: 'text-13 font-medium text-neutral-900 truncate',
   }),
   iconSm: tv({
      base: 'w-4 h-4',
   }),
   iconXs: tv({
      base: 'w-3.5 h-3.5 text-neutral-400 shrink-0',
   }),
   iconMd: tv({
      base: 'w-6 h-6',
   }),
   modal: {
      backdrop: tv({
         base: [
            'fixed inset-0 z-50 flex items-center justify-center p-primary',
            'bg-neutral-950/50 backdrop-blur-xs',
         ],
      }),
      panel: tv({
         base: [
            'w-full max-w-2xl max-h-[90vh] overflow-y-auto',
            'bg-neutral-50 border border-utility-400 rounded-secondary shadow-xl flex flex-col',
         ],
      }),
      header: tv({
         base: 'flex items-center justify-between px-secondary py-primary border-b border-utility-400 sticky top-0 bg-neutral-50 z-10',
      }),
      headerTitle: tv({
         base: 'text-18 font-semibold text-neutral-950',
      }),
      closeBtn: tv({
         base: 'p-1.5 text-neutral-500 hover:text-neutral-900 rounded-primary hover:bg-neutral-100 transition-colors cursor-pointer',
      }),
      body: tv({
         base: 'p-secondary grid grid-cols-1 sm:grid-cols-2 gap-primary',
      }),
      readOnlyStatusBox: tv({
         base: 'flex items-center justify-between px-3.5 py-2 bg-neutral-100 border border-utility-400 rounded-primary text-13 text-neutral-600',
      }),
      footer: tv({
         base: 'flex items-center justify-end gap-x-2 px-secondary py-primary border-t border-utility-400 bg-neutral-100/50',
      }),
      cancelBtn: tv({
         base: [
            'px-primary py-2 text-13 font-medium text-neutral-700',
            'bg-neutral-50 border border-utility-400 rounded-primary hover:bg-neutral-100 transition-colors cursor-pointer',
         ],
      }),
      saveBtn: tv({
         base: [
            'px-primary py-2 text-13 font-medium text-neutral-50',
            'bg-neutral-900 rounded-primary hover:bg-neutral-950 transition-colors cursor-pointer',
         ],
         variants: {
            disabled: {
               true: 'opacity-50 pointer-events-none cursor-not-allowed',
            },
         },
      }),
   },
};

