import { useEffect } from 'react';

import { useDeepState } from '@admin-web/hooks/deep-state';

import { LETTERS, NUMBERS, SPIN_INTERVAL_MS } from './constants';

import type * as Types from './type';

export function useLogic(properties: Types.Properties) {
   const { targetChar, isSpinning } = properties;
   const [state, setState] = useDeepState<Types.State>({
      spinningChar: targetChar,
   });

   const isPunctuation = /^[^a-zA-Z0-9?]$/.test(targetChar);
   const effectiveSpinning = isSpinning && !isPunctuation;

   useEffect(() => {
      if (!effectiveSpinning) {
         return;
      }

      const isNumeric = /^\d$/.test(targetChar);
      const charPool = isNumeric ? NUMBERS : LETTERS;

      const intervalId = window.setInterval(() => {
         const randomChar = charPool[Math.floor(Math.random() * charPool.length)];
         setState(randomChar, 'spinningChar');
      }, SPIN_INTERVAL_MS);

      return () => {
         window.clearInterval(intervalId);
      };
   }, [effectiveSpinning, setState, targetChar]);

   const displayChar = effectiveSpinning ? state.spinningChar : targetChar;

   return {
      param: {
         displayChar,
         isSpinning: effectiveSpinning,
      },
   };
}

