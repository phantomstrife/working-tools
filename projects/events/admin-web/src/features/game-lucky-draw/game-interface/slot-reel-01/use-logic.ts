import { useEffect, useMemo } from 'react';
import type { CSSProperties } from 'react';

import { useDeepState } from '@admin-web/hooks/deep-state';

import { ALPHANUMERIC, LETTERS, NUMBERS, SPIN_INTERVAL_MS, SPLIT_FLAP_STRIP_COUNT } from './constants';

import type * as Types from './type';

const buildRollStrip = (pool: string, seedIndex: number): string[] => {
   const base: string[] = [];
   const poolLen = pool.length;
   const step = poolLen > 11 ? 7 : 3;
   const offset = (seedIndex * 3 + 1) % poolLen;

   for (let i = 0; i < SPLIT_FLAP_STRIP_COUNT; i += 1) {
      base.push(pool[(offset + i * step) % poolLen]);
   }

   return [...base, ...base];
};

export function useLogic(properties: Types.Properties) {
   const {
      targetChar,
      isSpinning,
      variant = 'default',
      status,
      columnIndex = 0,
      isVictory = false,
      isVictoryRevealed = false,
   } = properties;
   const [state, setState] = useDeepState<Types.State>({
      spinningChar: targetChar,
   });

   const isPunctuation = /^[^a-zA-Z0-9?]$/.test(targetChar);
   const effectiveSpinning = isSpinning && !isPunctuation;
   const isSplitFlap = variant === 'split-flap';

   useEffect(() => {
      if (!effectiveSpinning || isSplitFlap) {
         return;
      }

      const isNumeric = /^\d$/.test(targetChar);
      const charPool = isNumeric ? NUMBERS : targetChar === '?' ? ALPHANUMERIC : LETTERS;

      const pickRandomChar = () => {
         const randomChar = charPool[Math.floor(Math.random() * charPool.length)];
         setState(randomChar, 'spinningChar');
      };

      const initialTimerId = window.setTimeout(pickRandomChar, 0);
      const intervalId = window.setInterval(pickRandomChar, SPIN_INTERVAL_MS);

      return () => {
         window.clearTimeout(initialTimerId);
         window.clearInterval(intervalId);
      };
   }, [effectiveSpinning, isSplitFlap, setState, targetChar]);

   const poolKind: 'numbers' | 'alphanumeric' | 'letters' = /^\d$/.test(targetChar)
      ? 'numbers'
      : targetChar === '?'
        ? 'alphanumeric'
        : 'letters';

   const rollStrip = useMemo(() => {
      const charPool = poolKind === 'numbers' ? NUMBERS : poolKind === 'alphanumeric' ? ALPHANUMERIC : LETTERS;
      return buildRollStrip(charPool, columnIndex);
   }, [columnIndex, poolKind]);

   const columnStyle = useMemo(
      () =>
         ({
            '--sf-col-index': columnIndex,
            '--sf-col-phase': columnIndex % 3,
         }) as CSSProperties,
      [columnIndex],
   );

   const displayChar = effectiveSpinning && !isSplitFlap ? state.spinningChar : targetChar;
   const columnState: Types.Column_State = status ?? (isSpinning ? 'spinning' : 'standby');

   return {
      param: {
         displayChar,
         isSpinning: effectiveSpinning,
         isSplitFlap,
         columnState,
         rollStrip,
         columnStyle,
         isVictory,
         isVictoryRevealed,
      },
   };
}

