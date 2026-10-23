import { tv } from 'tailwind-variants';

export const useStyle = {
   page: tv({
      base: 'min-h-screen bg-neutral-950 text-neutral-100 p-secondary',
   }),
   container: tv({
      base: 'mx-auto max-w-6xl flex flex-col gap-6',
   }),
   header: tv({
      base: 'flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-4',
   }),
   headerLeft: tv({
      base: 'flex flex-col gap-0.5',
   }),
   headerTitle: tv({
      base: 'text-24 font-bold text-warning-400',
   }),
   headerSubtitle: tv({
      base: 'text-13 text-neutral-400',
   }),
   headerActions: tv({
      base: 'flex items-center gap-2',
   }),
   backBtn: tv({
      base: [
         'px-3.5 py-2 text-13 font-semibold rounded-primary bg-neutral-800',
         'hover:bg-neutral-700 text-neutral-100 border border-neutral-700 transition-colors cursor-pointer',
      ],
   }),
   signOutBtn: tv({
      base: [
         'px-3.5 py-2 text-13 font-medium rounded-primary bg-neutral-900',
         'border border-neutral-700 hover:bg-neutral-800 text-neutral-300 transition-colors cursor-pointer',
      ],
   }),
   selectorGrid: tv({
      base: 'grid grid-cols-1 gap-3 md:grid-cols-2',
   }),
   selectField: tv({
      base: [
         'w-full px-3.5 py-2.5 text-13 text-neutral-50 bg-neutral-900 border border-neutral-700',
         'rounded-primary focus:outline-none focus:border-warning-500 transition-colors cursor-pointer',
      ],
      variants: {
         disabled: {
            true: 'opacity-50 pointer-events-none cursor-not-allowed',
         },
      },
   }),
   noticeBanner: tv({
      base: 'rounded-primary border p-3 text-13 font-semibold',
      variants: {
         kind: {
            ok: 'border-success-700 bg-success-950/60 text-success-300',
            error: 'border-error-700 bg-error-950/60 text-error-300',
         },
      },
   }),
   emptySelectionBox: tv({
      base: 'rounded-secondary border border-dashed border-neutral-800 p-12 text-center text-14 text-neutral-500',
   }),
   workspaceGrid: tv({
      base: 'grid grid-cols-1 gap-6 lg:grid-cols-2',
   }),
   columnSection: tv({
      base: 'flex flex-col gap-4',
   }),
   sectionHeading: tv({
      base: 'text-12 font-bold uppercase tracking-wider text-neutral-400',
   }),
   pendingCard: tv({
      base: 'flex flex-col gap-3 rounded-secondary border border-warning-600 bg-neutral-900 p-primary shadow-xl',
   }),
   pendingName: tv({
      base: 'text-20 font-bold text-neutral-50',
   }),
   detailsGrid: tv({
      base: 'grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-13',
   }),
   detailTerm: tv({
      base: 'text-neutral-400 font-medium',
   }),
   detailValue: tv({
      base: 'text-neutral-100 truncate',
   }),
   detailTicket: tv({
      base: 'font-mono font-bold text-warning-300',
   }),
   warningAlert: tv({
      base: 'rounded-primary bg-error-950/60 border border-error-800 p-2.5 text-12 text-error-300',
   }),
   pendingActions: tv({
      base: 'flex items-center gap-2 pt-1',
   }),
   confirmBtn: tv({
      base: [
         'flex-1 rounded-primary bg-success-600 px-4 py-2.5 text-13 font-bold text-neutral-50',
         'hover:bg-success-500 transition-colors cursor-pointer',
      ],
      variants: {
         disabled: {
            true: 'opacity-40 pointer-events-none cursor-not-allowed',
         },
      },
   }),
   cancelBtn: tv({
      base: [
         'rounded-primary bg-neutral-800 border border-neutral-700 px-4 py-2.5',
         'text-13 font-semibold text-neutral-200 hover:bg-neutral-700 transition-colors cursor-pointer',
      ],
   }),
   resultsContainer: tv({
      base: 'overflow-hidden rounded-secondary border border-neutral-800 bg-neutral-900',
   }),
   resultsPlaceholder: tv({
      base: 'p-6 text-center text-13 text-neutral-500',
   }),
   resultsList: tv({
      base: 'max-h-[55vh] divide-y divide-neutral-800 overflow-y-auto',
   }),
   resultRow: tv({
      base: 'flex items-center justify-between gap-3 p-3.5 hover:bg-neutral-800/50 transition-colors',
   }),
   resultInfo: tv({
      base: 'min-w-0 flex flex-col gap-0.5',
   }),
   resultName: tv({
      base: 'truncate font-semibold text-14 text-neutral-50',
   }),
   resultContact: tv({
      base: 'truncate text-12 text-neutral-400',
   }),
   resultMetaRow: tv({
      base: 'flex items-center gap-2 text-12 mt-0.5',
   }),
   resultTicket: tv({
      base: 'font-mono font-semibold text-warning-300',
   }),
   resultStatusBadge: tv({
      base: 'font-semibold',
      variants: {
         checkedIn: {
            true: 'text-success-400',
            false: 'text-neutral-400',
         },
      },
   }),
   selectGuestBtn: tv({
      base: [
         'shrink-0 rounded-primary bg-warning-500 px-3 py-1.5 text-12 font-bold',
         'text-neutral-950 hover:bg-warning-400 transition-colors cursor-pointer',
      ],
   }),
};

