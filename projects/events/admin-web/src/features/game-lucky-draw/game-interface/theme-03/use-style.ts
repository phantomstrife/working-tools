import { cx, tv } from 'tailwind-variants';

import css from './style.module.css';

export const useStyle = {
   stageWrapper: tv({
      base: css.stage_wrapper,
   }),
   stageCanvas: tv({
      base: css.stage_canvas,
   }),
   stageBg: tv({
      base: css.stage_bg,
   }),
   fullscreenBtn: tv({
      base: [
         'fixed top-4 right-4 z-30 size-9 flex items-center justify-center rounded-primary',
         'bg-neutral-900/80 text-neutral-300 hover:text-neutral-50 hover:bg-neutral-800',
         'border border-neutral-700/80 shadow-lg backdrop-blur-md transition-colors cursor-pointer',
      ],
   }),
   leftZone: tv({
      base: css.left_zone,
   }),
   prizeTitle: tv({
      base: css.prize_title,
   }),
   statusText: tv({
      base: css.status_text,
   }),
   rightBox: tv({
      base: css.right_box,
   }),
   reelLayer: tv({
      base: css.reel_layer,
   }),
   reelRow: tv({
      base: css.reel_row,
   }),
   winnerOverlay: tv({
      base: css.winner_overlay,
   }),
   winnerCloseBtn: tv({
      base: css.winner_close_btn,
   }),
   winnerCloseIcon: tv({
      base: css.winner_close_icon,
   }),
   winnerTicketBadge: tv({
      base: css.winner_ticket_badge,
   }),
   winnerCompany: tv({
      base: css.winner_company,
   }),
   winnerName: tv({
      base: css.winner_name,
      variants: {
         compact: {
            true: css.winner_name_compact,
            false: '',
         },
      },
      defaultVariants: {
         compact: false,
      },
   }),
   winnerPhonePill: tv({
      base: css.winner_phone_pill,
   }),
   winnerPhoneIcon: tv({
      base: css.winner_phone_icon,
   }),
   winnersOverlay: tv({
      base: [
         'fixed inset-4 right-auto z-30 sm:w-80 flex flex-col rounded-secondary',
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
      base: cx('truncate font-semibold text-neutral-50 text-13'),
   }),
   winnerOrgText: tv({
      base: 'truncate text-11 text-neutral-400',
   }),
   winnerPhoneText: tv({
      base: 'truncate text-11 font-mono text-warning-200',
   }),
   winnerListTicketBadge: tv({
      base: [
         'shrink-0 px-2 py-0.5 text-11 font-mono font-bold tracking-wider rounded-primary',
         'bg-warning-950/70 text-warning-300 border border-warning-700/50',
      ],
   }),
};
