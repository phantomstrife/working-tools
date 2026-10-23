import { useEffect, useMemo } from 'react';
import backgroundImage from '@renderer/assets/lucky-draw/background.jpg';
import resultBar from '@renderer/assets/lucky-draw/result-bar.png';
import { useDrawStore } from '@renderer/stores/lucky-draw';

export function useLogic() {
   const prizes = useDrawStore((s) => s.prizes);
   const participants = useDrawStore((s) => s.participants);
   const winners = useDrawStore((s) => s.winners);
   const currentPrizeIndex = useDrawStore((s) => s.currentPrizeIndex);
   const winnerId = useDrawStore((s) => s.winnerId);
   const isSpinning = useDrawStore((s) => s.isSpinning);
   const stoppedReels = useDrawStore((s) => s.stoppedReels);
   const handleManualStop = useDrawStore((s) => s.handleManualStop);
   const showWinners = useDrawStore((s) => s.showWinners);
   const setShowWinners = useDrawStore((s) => s.setShowWinners);
   const setHideHud = useDrawStore((s) => s.setHideHud);

   const currentPrize = prizes[currentPrizeIndex] ?? null;

   const hiddenTicketCode = isSpinning ? winnerId : null;

   const prizeWinners = useMemo(
      () =>
         currentPrize
            ? winners.filter((w) => w.prizeId === currentPrize.id && w.ticketCode !== hiddenTicketCode)
            : [],
      [winners, currentPrize, hiddenTicketCode],
   );

   const remaining = currentPrize
      ? isSpinning
         ? Math.min(currentPrize.totalQuantity, currentPrize.remainingQuantity + 1)
         : currentPrize.remainingQuantity
      : 0;

   const prizeDone = Boolean(currentPrize && remaining === 0);

   const winningParticipant = participants.find((p) => p.id === winnerId) ?? null;

   const displayName = isSpinning
      ? 'Đang tìm kiếm người may mắn...'
      : winningParticipant
        ? winningParticipant.name
        : !currentPrize
          ? 'Vui lòng chọn giải thưởng'
          : prizeDone
            ? 'Đã hết giải thưởng'
            : 'Sẵn sàng';

   useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
         const target = e.target;
         if (
            target instanceof HTMLElement &&
            (target.tagName === 'SELECT' || target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')
         ) {
            return;
         }

         if (e.code === 'Space') {
            e.preventDefault();
            handleManualStop();
         } else if (e.code === 'KeyW') {
            setShowWinners((v) => !v);
         } else if (e.code === 'KeyH') {
            setHideHud((v) => !v);
         }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
   }, [handleManualStop, setShowWinners, setHideHud]);

   function handleCloseWinners() {
      setShowWinners(false);
   }

   return {
      param: {
         backgroundImage,
         resultBar,
         currentPrize,
         prizeWinners,
         remaining,
         prizeDone,
         winningParticipant,
         displayName,
         winnerChars: winnerId.split(''),
         isSpinning,
         stoppedReels,
         showWinners,
      },
      func: {
         handleCloseWinners,
      },
   };
}

