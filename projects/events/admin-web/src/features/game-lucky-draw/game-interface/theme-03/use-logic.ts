import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';

import { useTranslate } from '@admin-web/locale';
import { useStoreLuckyDraw } from '@admin-web/stores/lucky-draw';

import type * as Types from './type';

const BACKGROUND_IMAGE = '/assets/images/lucky-draw-theme-03-background.jpeg';

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

const resolveEffectiveAttendeePhone = (person: {
   phone?: string | null;
   representativePhone?: string | null;
}): string => {
   return person.representativePhone?.trim() || person.phone?.trim() || '';
};

export function useLogic() {
   const { translate } = useTranslate({
      prefix: 'features.operator.board',
   });

   const stageRef = useRef<HTMLDivElement | null>(null);
   const [isFullscreen, setIsFullscreen] = useState(false);
   const [dismissedWinnerRecordId, setDismissedWinnerRecordId] = useState<string | null>(null);

   const prizes = useStoreLuckyDraw((s) => s.prizes);
   const participants = useStoreLuckyDraw((s) => s.participants);
   const winners = useStoreLuckyDraw((s) => s.winners);
   const currentPrizeIndex = useStoreLuckyDraw((s) => s.currentPrizeIndex);
   const winnerId = useStoreLuckyDraw((s) => s.winnerId);
   const activeWinnerRecordId = useStoreLuckyDraw((s) => s.activeWinnerRecordId);
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

   const revealedWinnerCard = useMemo<Types.Winner_Card_Data | null>(() => {
      if (!activeWinnerRecordId) {
         return null;
      }

      const winnerRecord = winners.find((w) => w.id === activeWinnerRecordId);
      const fallbackParticipant = participants.find((p) => p.ticketCode === winnerId || p.id === winnerId) ?? null;
      const source = winnerRecord ?? fallbackParticipant;

      if (!source) {
         return null;
      }

      const displayName = resolveEffectiveAttendeeName(source);
      const displayPhone = resolveEffectiveAttendeePhone(source);

      return {
         ticketCode: source.ticketCode,
         companyName: source.companyName?.trim() || '',
         displayName,
         displayPhone,
         isCompactName: displayName.length > 22,
      };
   }, [activeWinnerRecordId, participants, winnerId, winners]);

   const isWinnerCardVisible = Boolean(
      !isSpinning &&
      !isDrawingRequest &&
      activeWinnerRecordId &&
      dismissedWinnerRecordId !== activeWinnerRecordId &&
      revealedWinnerCard,
   );

   const statusKey: Types.Stage_Status_Key = !currentPrize
      ? 'select_prize_status'
      : isSpinning || isDrawingRequest
        ? 'drawing_status'
        : isWinnerCardVisible
          ? 'winner_status'
          : prizeDone
            ? 'prize_exhausted_status'
            : 'standby_status';

   const winnerChars = winnerId.split('');
   const reelRowStyle = useMemo(
      () =>
         ({
            '--reel-cols': Math.max(1, winnerChars.length),
         }) as CSSProperties,
      [winnerChars.length],
   );

   const isAllReelsLocked = Boolean(
      !isDrawingRequest &&
      activeWinnerRecordId &&
      winnerChars.length > 0 &&
      stoppedReels >= winnerChars.length,
   );
   const isVictoryRevealed = Boolean(isAllReelsLocked && dismissedWinnerRecordId === activeWinnerRecordId);

   const getColumnState = useCallback(
      (index: number): Types.Reel_Column_State => {
         if (isSpinning) {
            return index < stoppedReels ? 'locked' : 'spinning';
         }

         if (!isDrawingRequest && activeWinnerRecordId && stoppedReels > index) {
            return 'locked';
         }

         return 'standby';
      },
      [activeWinnerRecordId, isDrawingRequest, isSpinning, stoppedReels],
   );

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

   const handleCloseWinners = useCallback(() => {
      setShowWinners(false);
   }, [setShowWinners]);

   const handleCloseWinnerOverlay = useCallback(() => {
      if (activeWinnerRecordId) {
         setDismissedWinnerRecordId(activeWinnerRecordId);
      }
   }, [activeWinnerRecordId]);

   return {
      stageRef,
      param: {
         backgroundImage: BACKGROUND_IMAGE,
         currentPrize,
         prizeWinners,
         statusText: translate(`theme_03.${statusKey}`),
         winnerChars,
         reelRowStyle,
         isSpinning,
         stoppedReels,
         isAllReelsLocked,
         isVictoryRevealed,
         isWinnerCardVisible,
         revealedWinnerCard,
         showWinners,
         isFullscreen,
      },
      func: {
         translate,
         getColumnState,
         resolveEffectiveAttendeeName,
         resolveEffectiveAttendeePhone,
         handleCloseWinners,
         handleCloseWinnerOverlay,
         handleToggleFullscreen,
      },
   };
}
