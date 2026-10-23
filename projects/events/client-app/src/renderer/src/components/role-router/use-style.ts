import { tv } from 'tailwind-variants';

export const useStyle = {
   loadingScreen: tv({
      base: 'min-h-screen w-full flex items-center justify-center bg-neutral-950 text-neutral-400 text-14',
   }),
   loadingPill: tv({
      base: 'flex items-center gap-3 px-5 py-3 rounded-secondary bg-neutral-900 border border-neutral-800',
   }),
   pulseDot: tv({
      base: 'w-2.5 h-2.5 rounded-full bg-warning-400 animate-ping',
   }),
   restrictedScreen: tv({
      base: 'min-h-screen w-full flex items-center justify-center bg-neutral-950 p-primary text-neutral-100',
   }),
   restrictedCard: tv({
      base: 'max-w-sm w-full p-secondary rounded-secondary bg-neutral-900 border border-neutral-800 shadow-2xl flex flex-col items-center gap-4 text-center',
   }),
   restrictedBadge: tv({
      base: [
         'inline-flex px-3 py-1 rounded-primary text-11 font-bold uppercase tracking-wider',
         'bg-error-950/70 text-error-300 border border-error-800',
      ],
   }),
   restrictedTitle: tv({
      base: 'text-20 font-bold text-neutral-50',
   }),
   restrictedDesc: tv({
      base: 'text-13 text-neutral-400',
   }),
   restrictedSignOutBtn: tv({
      base: [
         'w-full rounded-primary bg-neutral-800 border border-neutral-700 px-4 py-2.5',
         'text-13 font-semibold text-neutral-200 hover:bg-neutral-700 hover:text-neutral-50 transition-colors cursor-pointer',
      ],
   }),
   topLeftBar: tv({
      base: [
         'fixed left-5 top-5 z-50 flex items-center gap-2 p-1.5 rounded-primary',
         'bg-neutral-900/90 border border-neutral-700/80 shadow-2xl backdrop-blur-md text-12 text-neutral-200 select-none',
      ],
   }),
   staffNameText: tv({
      base: 'pl-2.5 pr-1 font-medium text-neutral-200 truncate max-w-40',
   }),
   roleBadge: tv({
      base: [
         'px-2 py-0.5 rounded-primary text-10 font-bold uppercase tracking-wider',
         'bg-warning-950/80 text-warning-300 border border-warning-700/70',
      ],
   }),
   gateSwitchBtn: tv({
      base: [
         'rounded-primary bg-neutral-800 hover:bg-warning-500 hover:text-neutral-950',
         'px-3 py-1.5 font-semibold text-neutral-50 border border-neutral-700 transition-colors cursor-pointer',
      ],
   }),
   hudToggleBtn: tv({
      base: [
         'rounded-primary px-2.5 py-1.5 font-semibold text-neutral-400',
         'hover:text-neutral-50 hover:bg-neutral-800 transition-colors cursor-pointer',
      ],
   }),
   signOutTopBtn: tv({
      base: [
         'rounded-primary px-3 py-1.5 font-semibold text-neutral-400',
         'hover:text-neutral-50 hover:bg-neutral-800 transition-colors cursor-pointer',
      ],
   }),
};

