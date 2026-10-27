import { useEffect, useState } from 'react';

export type SlotReelProps = {
   targetChar: string;
   isSpinning: boolean;
};

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NUMBERS = '0123456789';

export function useLogic(props: SlotReelProps) {
   const { targetChar, isSpinning } = props;
   const [spinningChar, setSpinningChar] = useState<string>(targetChar);

   const isPunctuation = /^[^a-zA-Z0-9?]$/.test(targetChar);
   const effectiveSpinning = isSpinning && !isPunctuation;

   useEffect(() => {
      if (!effectiveSpinning) {
         return;
      }

      const isNumeric = /^\d$/.test(targetChar);
      const charPool = isNumeric ? NUMBERS : LETTERS;

      const intervalId = setInterval(() => {
         const randomChar = charPool[Math.floor(Math.random() * charPool.length)];
         setSpinningChar(randomChar);
      }, 50);

      return () => {
         clearInterval(intervalId);
      };
   }, [effectiveSpinning, targetChar]);

   const displayChar = effectiveSpinning ? spinningChar : targetChar;

   return {
      param: {
         displayChar,
         isSpinning: effectiveSpinning,
      },
      func: {},
   };
}

