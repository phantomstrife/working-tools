import { useEffect, useMemo } from 'react';

import backgroundImage from '@client-app/assets/images/background.jpg';
import resultBar from '@client-app/assets/images/result-bar.png';
import { useTranslate } from '@client-app/locale';
import { useStoreLuckyDraw } from '@client-app/store/lucky-draw';

export function useLogic() {
   const { translate } = useTranslate({
      prefix: 'features.operator.board',
   });

   const prizes = useStoreLuckyDraw((s) => s.prizes);
   const participants = useStoreLuckyDraw((s) => s.participants);
   const winners = useStoreLuckyDraw((s) => s.winners);
   const currentPrizeIndex = useStoreLuckyDraw((s) => s.currentPrizeIndex);
   const winnerId = useStoreLuckyDraw((s) => s.winnerId);
   const isSpinning = useStoreLuckyDraw((s) => s.isSpinning);
   const isDrawingRequest = useStoreLuckyDraw((s) => s.isDrawingRequest);
   const stoppedReels = useStoreLuckyDraw((s) => s.stoppedReels);
   const handleManualStop = useStoreLuckyDraw((s) => s.handleManualStop);
   const showWinners = useStoreLuckyDraw((s) => s.showWinners);
   const setShowWinners = useStoreLuckyDraw((s) => s.setShowWinners);
   const setHideHud = useStoreLuckyDraw((s) => s.setHideHud);

   const currentPrize = prizes[currentPrizeIndex] ?? null;

   const hiddenTicketCode = isSpinning ? winnerId : null;

   const prizeWinners = useMemo(
      () =>
         currentPrize ? winners.filter((w) => w.prizeId === currentPrize.id && w.ticketCode !== hiddenTicketCode) : [],
      [winners, currentPrize, hiddenTicketCode],
   );

   const remaining = currentPrize
      ? isSpinning
         ? Math.min(currentPrize.totalQuantity, currentPrize.remainingQuantity + 1)
         : currentPrize.remainingQuantity
      : 0;

   const prizeDone = Boolean(currentPrize && remaining === 0);

   const winningParticipant = participants.find((p) => p.ticketCode === winnerId || p.id === winnerId) ?? null;

   const displayName =
      isSpinning || isDrawingRequest
         ? translate('searching_winner')
         : winningParticipant
           ? winningParticipant.name
           : !currentPrize
             ? translate('select_prize')
             : prizeDone
               ? translate('prize_exhausted')
               : translate('ready');

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
         translate,
         handleCloseWinners,
      },
   };
}
