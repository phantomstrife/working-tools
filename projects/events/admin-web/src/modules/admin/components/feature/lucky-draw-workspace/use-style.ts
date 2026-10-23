import { tv } from 'tailwind-variants';

export const useStyle = {
   wrapper: tv({
      base: 'flex flex-col gap-y-secondary',
   }),
   workspaceBar: tv({
      base: [
         'flex flex-col gap-y-2 sm:flex-row sm:items-center sm:justify-between',
         'px-secondary py-3 bg-neutral-50 border border-utility-400 rounded-secondary shadow-xs',
      ],
   }),
   workspaceTitleGroup: tv({
      base: 'flex flex-wrap items-center gap-x-2.5 gap-y-1',
   }),
   workspaceBadge: tv({
      base: [
         'inline-flex items-center px-2.5 py-0.5 rounded-primary',
         'text-11 font-semibold uppercase tracking-wide border',
         'bg-primary-100/70 text-primary-800 border-primary-300',
      ],
   }),
   workspaceTitle: tv({
      base: 'text-15 font-semibold text-neutral-950',
   }),
   workspaceHint: tv({
      base: 'text-12 text-neutral-500',
   }),
   grid: tv({
      base: 'grid grid-cols-1 lg:grid-cols-2 gap-6 items-start',
   }),
};
