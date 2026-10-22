import React, { useEffect, useMemo } from 'react';
import clsx from 'clsx';
import { useDrawStore } from '../../../stores/lucky-draw';
import { SlotReel } from './SlotReel';
import backgroundImage from '../../../assets/lucky-draw/background.jpg';
import resultBar from '../../../assets/lucky-draw/result-bar.png';
import './style.css';

export const LuckyDrawBoard: React.FC = () => {
   const prizes = useDrawStore((s) => s.prizes);
   const participants = useDrawStore((s) => s.participants);
   const currentPrizeIndex = useDrawStore((s) => s.currentPrizeIndex);
   const winnerId = useDrawStore((s) => s.winnerId);
   const isSpinning = useDrawStore((s) => s.isSpinning);
   const stoppedReels = useDrawStore((s) => s.stoppedReels);
   const handleManualStop = useDrawStore((s) => s.handleManualStop);
   const showWinners = useDrawStore((s) => s.showWinners);
   const setShowWinners = useDrawStore((s) => s.setShowWinners);

   const currentPrize = prizes[currentPrizeIndex] || null;

   // The winner is saved before the animation ends, so hide them from the
   // list and counters until the reels have stopped (no spoilers).
   const hiddenId = isSpinning ? winnerId : null;

   const prizeWinners = useMemo(
      () => (currentPrize ? participants.filter((p) => p.prizeId === currentPrize.id && p.id !== hiddenId) : []),
      [participants, currentPrize, hiddenId],
   );

   const remaining = currentPrize ? Math.max(currentPrize.quantity - prizeWinners.length, 0) : 0;
   const prizeDone = !!currentPrize && remaining === 0;

   const winningParticipant = participants.find((p) => p.id === winnerId);

   const displayName = isSpinning
      ? 'Đang tìm kiếm người may mắn...'
      : winningParticipant
        ? winningParticipant.name
        : !currentPrize
          ? 'Vui lòng chọn giải thưởng'
          : prizeDone
            ? 'Đã hết giải thưởng'
            : 'Sẵn sàng';

   // Space = stop reel (manual mode), W = toggle winners list.
   // Ignored while a dropdown/input has focus so the operator panel still works.
   useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
         const tag = (e.target as HTMLElement)?.tagName;
         if (tag === 'SELECT' || tag === 'INPUT' || tag === 'TEXTAREA') return;

         if (e.code === 'Space') {
            e.preventDefault();
            handleManualStop();
         } else if (e.code === 'KeyW') {
            setShowWinners((v) => !v);
         }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
   }, [handleManualStop, setShowWinners]);

   return (
      <div
         className="relative flex flex-col items-center justify-center min-h-screen aspect-1/2"
         style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
         }}
      >
         {/* Winners overlay (press W or use Operator Panel to toggle) */}
         {showWinners && currentPrize && (
            <div className="absolute top-4 right-4 z-20 w-72 max-h-[55vh] flex flex-col rounded-2xl bg-slate-900/90 border border-slate-700/80 text-slate-100 shadow-2xl backdrop-blur-md overflow-hidden">
               <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-slate-800 bg-slate-950/50">
                  <div className="min-w-0">
                     <div className="text-xs font-bold uppercase tracking-wider text-yellow-400">Người trúng giải</div>
                     <div className="truncate text-xs text-slate-400">{currentPrize.name}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                     <span className="px-2 py-0.5 text-xs font-bold tabular-nums rounded-full bg-yellow-950/70 text-yellow-300 border border-yellow-700/70">
                        {prizeWinners.length}/{currentPrize.quantity}
                     </span>
                     <button
                        onClick={() => setShowWinners(false)}
                        title="Đóng (W)"
                        className="w-6 h-6 grid place-items-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                     >
                        ×
                     </button>
                  </div>
               </div>

               <div className="p-3 overflow-y-auto">
                  {prizeWinners.length === 0 ? (
                     <p className="py-6 text-center text-xs text-slate-400">Chưa có người trúng giải</p>
                  ) : (
                     <ul className="flex flex-col gap-1.5 text-sm">
                        {prizeWinners.map((p, idx) => (
                           <li
                              key={p.registrationId}
                              className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-slate-800/70 border border-slate-700/60"
                           >
                              <div className="flex items-center gap-2 min-w-0">
                                 <span className="text-xs font-semibold tabular-nums text-slate-400 w-5">
                                    #{idx + 1}
                                 </span>
                                 <span className="truncate font-medium text-white">{p.name}</span>
                              </div>
                              <span className="shrink-0 px-2 py-0.5 text-xs font-mono font-bold tracking-wider rounded bg-yellow-950/60 text-yellow-300 border border-yellow-700/50">
                                 {p.id}
                              </span>
                           </li>
                        ))}
                     </ul>
                  )}
               </div>
            </div>
         )}

         <div className={clsx('grid grid-cols-1 absolute left-4 right-4 bottom-20 gap-y-6', 'info_wrapper')}>
            {/* Winner name above the result bar */}
            <div className={clsx('flex flex-col items-center text-center gap-y-2', 'winner')}>
               {!isSpinning && winningParticipant && (
                  <span className="text-2xl font-extrabold tracking-wider text-yellow-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] uppercase">
                     Chúc mừng người chiến thắng
                  </span>
               )}
               <h2 className="text-3xl font-extrabold tracking-wider text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] uppercase">
                  {displayName}
               </h2>
            </div>

            <div
               className={clsx('flex justify-start px-2 aspect-4/1', 'reel')}
               style={{
                  backgroundImage: `url(${resultBar})`,
                  backgroundSize: 'contain',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
               }}
            >
               {winnerId.split('').map((char, index) => (
                  <SlotReel key={index} targetChar={char} isSpinning={isSpinning && index >= stoppedReels} />
               ))}
            </div>

            {currentPrize && (
               <div className={clsx('grid grid-cols-[1fr_2fr] items-center justify-between', 'prize')}>
                  <img
                     src={currentPrize.imageUrl}
                     alt={currentPrize.name}
                     className={clsx('object-contain w-full', prizeDone && !isSpinning && 'opacity-60 grayscale')}
                  />
                  <div className="bg-clip-text grid place-items-center gap-y-1 bg-[radial-gradient(circle_at_center,#1e4fe0_0%,#0a1a8c_65%,#050f5c_100%)]">
                     <h1 className="glow-text text-center font-bold uppercase leading-[1.3] tracking-wide text-[30px]">
                        {currentPrize.name}
                     </h1>
                     <span className="text-sm font-semibold uppercase tracking-wider text-yellow-300 tabular-nums">
                        {prizeDone ? 'Đã trao hết' : `Còn lại ${remaining}/${currentPrize.quantity}`}
                     </span>
                  </div>
               </div>
            )}
         </div>
      </div>
   );
};
