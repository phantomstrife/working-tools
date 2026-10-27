import { tv } from 'tailwind-variants';

export const useStyle = {
   stageWrapper: tv({
      base: 'relative w-full min-h-screen bg-neutral-950 flex items-center justify-center overflow-hidden',
   }),
   boardCanvas: tv({
      base: 'relative flex flex-col items-center justify-center min-h-screen aspect-1/2 bg-contain bg-center bg-no-repeat',
   }),
   winnersOverlay: tv({
      base: [
         'fixed top-5 right-5 z-30 w-80 max-h-[60vh] flex flex-col rounded-secondary',
         'bg-neutral-900/95 border border-neutral-700/80 text-neutral-100 shadow-2xl backdrop-blur-md overflow-hidden',
      ],
   }),
   winnersHeader: tv({
      base: 'flex items-center justify-between gap-2 px-4 py-3 border-b border-neutral-800 bg-neutral-950/60',
   }),
   winnersHeaderLeft: tv({
      base: 'min-w-0',
   }),
   winnersTitle: tv({
      base: 'text-12 font-bold uppercase tracking-wider text-warning-400',
   }),
   winnersSubtitle: tv({
      base: 'truncate text-12 text-neutral-400',
   }),
   winnersHeaderRight: tv({
      base: 'flex items-center gap-2 shrink-0',
   }),
   winnersCountBadge: tv({
      base: [
         'px-2 py-0.5 text-11 font-bold tabular-nums rounded-primary',
         'bg-warning-950/80 text-warning-300 border border-warning-700/70',
      ],
   }),
   winnersCloseBtn: tv({
      base: [
         'w-6 h-6 grid place-items-center rounded-primary text-neutral-400',
         'hover:text-neutral-50 hover:bg-neutral-800 transition-colors cursor-pointer',
      ],
   }),
   winnersBody: tv({
      base: 'p-3 overflow-y-auto',
   }),
   winnersEmpty: tv({
      base: 'py-6 text-center text-12 text-neutral-400',
   }),
   winnersList: tv({
      base: 'flex flex-col gap-1.5 text-13',
   }),
   winnerItem: tv({
      base: 'flex items-center justify-between gap-2 px-2.5 py-2 rounded-primary bg-neutral-800/70 border border-neutral-700/60',
   }),
   winnerItemLeft: tv({
      base: 'flex items-center gap-2 min-w-0',
   }),
   winnerIndex: tv({
      base: 'text-11 font-semibold tabular-nums text-neutral-400 w-5 shrink-0',
   }),
   winnerNameBlock: tv({
      base: 'min-w-0 flex flex-col',
   }),
   winnerNameText: tv({
      base: 'truncate font-semibold text-neutral-50 text-13',
   }),
   winnerOrgText: tv({
      base: 'truncate text-11 text-neutral-400',
   }),
   winnerTicketBadge: tv({
      base: [
         'shrink-0 px-2 py-0.5 text-11 font-mono font-bold tracking-wider rounded-primary',
         'bg-warning-950/70 text-warning-300 border border-warning-700/50',
      ],
   }),
   infoWrapper: tv({
      base: 'grid grid-cols-1 absolute left-4 right-4 bottom-20 gap-y-6 info_wrapper',
   }),
   winnerBanner: tv({
      base: 'flex flex-col items-center text-center gap-y-1.5 winner',
   }),
   congratsLabel: tv({
      base: 'text-20 font-extrabold tracking-wider text-warning-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)] uppercase',
   }),
   displayNameHeading: tv({
      base: 'text-30 font-extrabold tracking-wider text-neutral-50 drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)] uppercase',
   }),
   companySubLabel: tv({
      base: 'text-14 font-semibold tracking-wide text-warning-200 drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)]',
   }),
   reelContainer: tv({
      base: 'flex justify-between items-center px-3 aspect-4/1 bg-contain bg-center bg-no-repeat reel',
   }),
   prizeContainer: tv({
      base: 'grid grid-cols-[1fr_2fr] items-center justify-between gap-3 prize',
   }),
   prizeImage: tv({
      base: 'object-contain w-full max-h-36',
      variants: {
         exhausted: {
            true: 'opacity-60 grayscale',
         },
      },
   }),
   prizeTextBox: tv({
      base: 'bg-clip-text grid place-items-center gap-y-1 bg-[radial-gradient(circle_at_center,#1e4fe0_0%,#0a1a8c_65%,#050f5c_100%)]',
   }),
   prizeTitle: tv({
      base: 'glow-text text-center font-bold uppercase leading-[1.3] tracking-wide text-30',
   }),
   prizeRemainingLabel: tv({
      base: 'text-14 font-semibold uppercase tracking-wider text-warning-300 tabular-nums',
   }),
};
