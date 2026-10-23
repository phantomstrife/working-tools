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
};

