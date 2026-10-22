import React, { useState, useEffect } from 'react';

interface SlotReelProps {
   targetChar: string;
   isSpinning: boolean;
}

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NUMBERS = '0123456789';

export const SlotReel: React.FC<SlotReelProps> = ({ targetChar, isSpinning }) => {
   const [displayChar, setDisplayChar] = useState<string>(targetChar);

   useEffect(() => {
      let intervalId: NodeJS.Timeout;

      if (isSpinning) {
         // Check if targetChar is a number or letter to pick the correct character set
         const isNumeric = /^\d$/.test(targetChar);
         const charPool = isNumeric ? NUMBERS : LETTERS;

         intervalId = setInterval(() => {
            const randomChar = charPool[Math.floor(Math.random() * charPool.length)];
            setDisplayChar(randomChar);
         }, 50); // Speed of character flashing
      } else {
         // Lock onto the final target character when stopped
         setDisplayChar(targetChar);
      }

      return () => {
         if (intervalId) clearInterval(intervalId);
      };
   }, [isSpinning, targetChar]);

   return (
      <div className="relative flex items-center justify-center h-full aspect-1/2 m-2 overflow-hidden">
         <div
            className={`absolute flex items-center justify-center w-full h-full text-5xl font-bold text-white transition-all ${
               isSpinning ? 'opacity-80 scale-95 blur-[0.5px]' : 'opacity-100 scale-100'
            }`}
         >
            {displayChar}
         </div>
      </div>
   );
};
