import { tv } from 'tailwind-variants';

export const useStyle = {
   scannerBox: tv({
      base: 'relative aspect-video w-full overflow-hidden rounded-secondary border border-neutral-700 bg-neutral-950',
   }),
   videoEl: tv({
      base: 'h-full w-full object-cover',
   }),
   hiddenCanvas: tv({
      base: 'hidden',
   }),
   reticleFrame: tv({
      base: 'pointer-events-none absolute inset-0 m-auto h-2/3 aspect-square rounded-primary border-2 border-warning-400/80',
   }),
   pausedOverlay: tv({
      base: 'absolute inset-0 grid place-items-center bg-neutral-950/65 text-14 font-semibold text-neutral-50',
   }),
   errorOverlay: tv({
      base: 'absolute inset-0 grid place-items-center bg-neutral-900 p-primary text-center text-13 text-error-400',
   }),
};

