import { useEffect, useState } from 'react';

import { LETTERS, NUMBERS, SPIN_INTERVAL_MS } from './constants';

import type * as Types from './type';

export function useLogic(properties: Types.Properties) {
   const { targetChar, isSpinning } = properties;
   const [spinningChar, setSpinningChar] = useState<string>(targetChar);

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
         setSpinningChar(randomChar);
      }, SPIN_INTERVAL_MS);

      return () => {
         window.clearInterval(intervalId);
      };
   }, [effectiveSpinning, targetChar]);

   const displayChar = effectiveSpinning ? spinningChar : targetChar;

   return {
      param: {
         displayChar,
         isSpinning: effectiveSpinning,
      },
   };
}
