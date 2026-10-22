// src/renderer/src/components/DataManager.tsx
import React from 'react';
import { useDrawStore } from '../stores/lucky-draw';

export const DataManager: React.FC = () => {
   const { prizes, drawMode, setDrawMode, startDraw, handleManualStop, isSpinning } = useDrawStore();

   return (
      <div className="fixed max-w-72 bottom-5 right-5 flex flex-col gap-4 z-50">
         {prizes.length > 0 && (
            <div className="flex flex-col items-center gap-4 p-4 border border-gray-600 rounded-lg bg-slate-800 shadow-xl">
               <div className="flex gap-4">
                  {(['auto', 'manual', 'instant'] as const).map((mode) => (
                     <label key={mode} className="flex items-center gap-2 cursor-pointer text-sm">
                        <input
                           type="radio"
                           name="drawMode"
                           value={mode}
                           checked={drawMode === mode}
                           onChange={(e) => setDrawMode(e.target.value as any)}
                           disabled={isSpinning}
                           className="w-4 h-4 text-yellow-500 bg-gray-800 border-gray-600 focus:ring-yellow-500 focus:ring-2"
                        />
                        <span className="capitalize text-gray-300">{mode}</span>
                     </label>
                  ))}
               </div>

               <div className="flex flex-col w-full gap-2 mt-2">
                  <button
                     onClick={startDraw}
                     disabled={(isSpinning && drawMode !== 'instant') || prizes.length === 0}
                     className="px-4 py-2.5 font-bold tracking-wider text-gray-900 transition-transform bg-yellow-500 rounded-lg shadow-lg hover:bg-yellow-400 disabled:opacity-50 disabled:scale-100 hover:scale-[1.02]"
                  >
                     {isSpinning ? 'SPINNING...' : 'START DRAW'}
                  </button>

                  {drawMode === 'manual' && isSpinning && (
                     <button
                        onClick={handleManualStop}
                        className="px-4 py-2.5 font-bold tracking-wider text-white transition-transform bg-red-600 rounded-lg shadow-lg hover:bg-red-500 hover:scale-[1.02]"
                     >
                        STOP NEXT (SPACE)
                     </button>
                  )}
               </div>
            </div>
         )}
      </div>
   );
};
