import { tv } from 'tailwind-variants';

import css from './style.module.css';

export const useStyle = {
   reelBox: tv({
      base: 'relative flex items-center justify-center overflow-hidden flex-1',
      variants: {
         variant: {
            default: 'h-full aspect-1/2 m-1 sm:m-2',
            bordered: 'h-full rounded-[0.65cqw] border-[0.16cqw] border-primary-600/80 bg-transparent',
            'split-flap': '',
         },
      },
      defaultVariants: {
         variant: 'default',
      },
   }),
   charText: tv({
      base: 'absolute flex items-center justify-center w-full h-full font-bold transition-all select-none',
      variants: {
         variant: {
            default: 'text-26! text-neutral-50',
            bordered: 'text-[4.4cqw] leading-none font-extrabold text-primary-700',
            'split-flap': '',
         },
         spinning: {
            true: 'opacity-80 scale-95 blur-[0.5px]',
            false: 'opacity-100 scale-100 animate-landing',
         },
      },
      defaultVariants: {
         variant: 'default',
      },
   }),
   splitFlapColumn: tv({
      base: css.split_flap_column,
   }),
   splitFlapFrame: tv({
      base: css.split_flap_frame,
      variants: {
         state: {
            standby: '',
            spinning: css.split_flap_frame_spinning,
            locked: css.split_flap_frame_locked,
         },
      },
      defaultVariants: {
         state: 'standby',
      },
   }),
   splitFlapCavity: tv({
      base: css.split_flap_cavity,
      variants: {
         victory: {
            true: css.split_flap_cavity_victory,
            false: '',
         },
         victoryRevealed: {
            true: css.split_flap_cavity_victory_revealed,
            false: '',
         },
      },
      defaultVariants: {
         victory: false,
         victoryRevealed: false,
      },
   }),
   splitFlapUpperHalf: tv({
      base: css.split_flap_upper_half,
   }),
   splitFlapLowerHalf: tv({
      base: css.split_flap_lower_half,
   }),
   splitFlapStripViewport: tv({
      base: css.split_flap_strip_viewport,
   }),
   splitFlapStrip: tv({
      base: css.split_flap_strip,
   }),
   splitFlapStripItem: tv({
      base: css.split_flap_strip_item,
   }),
   splitFlapStripGlyph: tv({
      base: css.split_flap_strip_glyph,
   }),
   splitFlapCharStage: tv({
      base: css.split_flap_char_stage,
      variants: {
         state: {
            standby: '',
            spinning: '',
            locked: css.split_flap_char_stage_locked,
         },
      },
      defaultVariants: {
         state: 'standby',
      },
   }),
   splitFlapChar: tv({
      base: css.split_flap_char,
      variants: {
         state: {
            standby: css.split_flap_char_standby,
            spinning: '',
            locked: '',
         },
      },
      defaultVariants: {
         state: 'standby',
      },
   }),
   splitFlapVignette: tv({
      base: css.split_flap_vignette,
   }),
   splitFlapSeam: tv({
      base: css.split_flap_seam,
   }),
   splitFlapPin: tv({
      base: css.split_flap_pin,
      variants: {
         side: {
            left: css.split_flap_pin_left,
            right: css.split_flap_pin_right,
         },
      },
   }),
   splitFlapStatusBar: tv({
      base: css.split_flap_status_bar,
      variants: {
         state: {
            standby: css.split_flap_status_standby,
            spinning: css.split_flap_status_spinning,
            locked: css.split_flap_status_locked,
         },
      },
      defaultVariants: {
         state: 'standby',
      },
   }),
};
