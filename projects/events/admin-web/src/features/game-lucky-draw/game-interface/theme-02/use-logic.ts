import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslate } from '@admin-web/locale';
import { useStoreLuckyDraw } from '@admin-web/stores/lucky-draw';

const backgroundImage = '/assets/images/background.jpg';
const resultBar = '/assets/images/result-bar.png';

const resolveEffectiveAttendeeName = (person: {
   salutation?: string | null;
   name?: string | null;
   representative?: string | null;
   representativeSalutation?: string | null;
}): string => {
   const representative = person.representative?.trim();

   if (representative) {
      return [person.representativeSalutation?.trim(), representative].filter(Boolean).join(' ');
   }

   return [person.salutation?.trim(), person.name?.trim()].filter(Boolean).join(' ');
};

export function useLogic() {
   const { translate } = useTranslate({
      prefix: 'features.operator.board',
   });

   const stageRef = useRef<HTMLDivElement | null>(null);
   const [isFullscreen, setIsFullscreen] = useState(false);

   const prizes = useStoreLuckyDraw((s) => s.prizes);
   const participants = useStoreLuckyDraw((s) => s.participants);
   const winners = useStoreLuckyDraw((s) => s.winners);
   const currentPrizeIndex = useStoreLuckyDraw((s) => s.currentPrizeIndex);
   const winnerId = useStoreLuckyDraw((s) => s.winnerId);
   const isSpinning = useStoreLuckyDraw((s) => s.isSpinning);
   const isDrawingRequest = useStoreLuckyDraw((s) => s.isDrawingRequest);
   const stoppedReels = useStoreLuckyDraw((s) => s.stoppedReels);
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
      ? isSpinning && !isDrawingRequest
         ? Math.min(currentPrize.totalQuantity, currentPrize.remainingQuantity + 1)
         : currentPrize.remainingQuantity
      : 0;
   const prizeDone = Boolean(currentPrize && remaining === 0);
   const isPrizeSoldOut = prizeDone && !isSpinning;

   const winningParticipant = participants.find((p) => p.ticketCode === winnerId || p.id === winnerId) ?? null;

   const winnerDisplayPhone = winningParticipant
      ? winningParticipant.representativePhone || winningParticipant.phone
      : null;

   const displayName =
      isSpinning || isDrawingRequest
         ? translate('searching_winner')
         : winningParticipant
           ? resolveEffectiveAttendeeName(winningParticipant)
           : !currentPrize
             ? translate('select_prize')
             : prizeDone
               ? translate('prize_exhausted')
               : translate('ready');

   const handleToggleFullscreen = useCallback(async () => {
      try {
         if (document.fullscreenElement) {
            await document.exitFullscreen();
         } else {
            await document.documentElement.requestFullscreen();
         }
      } catch {
         // Ignore fullscreen errors in restricted browser contexts
      }
   }, []);

   useEffect(() => {
      const handleFullscreenChange = () => {
         setIsFullscreen(Boolean(document.fullscreenElement));
      };

      handleFullscreenChange();
      document.addEventListener('fullscreenchange', handleFullscreenChange);
      return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
   }, []);

   useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
         const target = e.target;
         if (
            target instanceof HTMLElement &&
            (target.tagName === 'SELECT' ||
               target.tagName === 'INPUT' ||
               target.tagName === 'TEXTAREA' ||
               target.isContentEditable)
         ) {
            return;
         }

         const hasModifier = e.ctrlKey || e.metaKey || e.shiftKey;

         if (hasModifier && e.code === 'Space') {
            if (e.repeat) {
               return;
            }
            e.preventDefault();
            const storeState = useStoreLuckyDraw.getState();
            if (storeState.isSpinning) {
               storeState.handleManualStop();
            } else if (!storeState.isDrawingRequest) {
               void storeState.startDraw();
            }
         } else if (hasModifier && e.code === 'KeyW') {
            e.preventDefault();
            setShowWinners((v) => !v);
         } else if (hasModifier && e.code === 'KeyH') {
            e.preventDefault();
            setHideHud((v) => !v);
         } else if (hasModifier && e.code === 'KeyF') {
            e.preventDefault();
            void handleToggleFullscreen();
         }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
   }, [handleToggleFullscreen, setShowWinners, setHideHud]);

   function handleCloseWinners() {
      setShowWinners(false);
   }

   return {
      stageRef,
      param: {
         backgroundImage,
         resultBar,
         currentPrize,
         prizeWinners,
         remaining,
         prizeDone,
         isPrizeSoldOut,
         winningParticipant,
         winnerDisplayPhone,
         displayName,
         winnerChars: winnerId.split(''),
         isSpinning,
         stoppedReels,
         showWinners,
         isFullscreen,
      },
      func: {
         translate,
         resolveEffectiveAttendeeName,
         handleCloseWinners,
         handleToggleFullscreen,
      },
   };
}
