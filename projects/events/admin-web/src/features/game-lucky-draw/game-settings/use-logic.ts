import { useMemo } from 'react';
import { useRouter } from 'next/navigation';

import { useTranslate } from '@admin-web/locale';
import { ROUTE } from '@admin-web/routes/constants';
import { useServicesAccountLogout } from '@admin-web/services/account/logout';
import { useStoreLuckyDraw } from '@admin-web/stores/lucky-draw';
import { DRAW_MODES } from '@admin-web/stores/lucky-draw/constants';
import { useStoreSession } from '@admin-web/stores/session';

export { DRAW_MODES };

export function useLogic() {
   const router = useRouter();

   const { translate } = useTranslate({
      prefix: 'features.operator.controls',
   });

   const { translate: translateRoot } = useTranslate({
      prefix: '',
   });

   const events = useStoreSession((s) => s.events);
   const selectedEventId = useStoreSession((s) => s.selectedEventId);
   const selectedGameId = useStoreSession((s) => s.selectedGameId);
   const isLoadingAssignments = useStoreSession((s) => s.isLoadingAssignments);
   const setUnauthenticated = useStoreSession((s) => s.setUnauthenticated);

   const storeGameId = useStoreLuckyDraw((s) => s.gameId);
   const prizes = useStoreLuckyDraw((s) => s.prizes);
   const winners = useStoreLuckyDraw((s) => s.winners);
   const currentPrizeIndex = useStoreLuckyDraw((s) => s.currentPrizeIndex);
   const activeWinnerId = useStoreLuckyDraw((s) => s.activeWinnerId);
   const activeWinnerRecordId = useStoreLuckyDraw((s) => s.activeWinnerRecordId);
   const isSpinning = useStoreLuckyDraw((s) => s.isSpinning);
   const isDrawingRequest = useStoreLuckyDraw((s) => s.isDrawingRequest);
   const isLoadingGame = useStoreLuckyDraw((s) => s.isLoadingGame);
   const stoppedReels = useStoreLuckyDraw((s) => s.stoppedReels);
   const winnerId = useStoreLuckyDraw((s) => s.winnerId);
   const drawMode = useStoreLuckyDraw((s) => s.drawMode);
   const hideHud = useStoreLuckyDraw((s) => s.hideHud);
   const notice = useStoreLuckyDraw((s) => s.notice);

   const loadGameData = useStoreLuckyDraw((s) => s.loadGameData);
   const cleanupRealtime = useStoreLuckyDraw((s) => s.cleanupRealtime);
   const setCurrentPrize = useStoreLuckyDraw((s) => s.setCurrentPrize);
   const setDrawMode = useStoreLuckyDraw((s) => s.setDrawMode);
   const clearNotice = useStoreLuckyDraw((s) => s.clearNotice);
   const startDraw = useStoreLuckyDraw((s) => s.startDraw);
   const handleManualStop = useStoreLuckyDraw((s) => s.handleManualStop);
   const redrawAbsentWinner = useStoreLuckyDraw((s) => s.redrawAbsentWinner);

   const activeGameId = selectedGameId || storeGameId;
   const selectedEvent = events.find((item) => item.id === selectedEventId) ?? null;
   const selectedGame = selectedEvent?.games.find((item) => item.id === activeGameId) ?? null;
   const isLuckyDrawGame = !selectedGame || selectedGame.game_type === 'LUCKY_DRAW';

   const hiddenTicketCode = isSpinning ? winnerId : null;

   const wonByPrize = useMemo(() => {
      const counts = new Map<string, number>();

      for (const w of winners) {
         if (w.ticketCode !== hiddenTicketCode) {
            counts.set(w.prizeId, (counts.get(w.prizeId) ?? 0) + 1);
         }
      }

      return counts;
   }, [winners, hiddenTicketCode]);

   const busy = isSpinning || isDrawingRequest || isLoadingGame || isLoadingAssignments;
   const currentPrize = prizes[currentPrizeIndex] ?? null;
   const currentPrizeDone = Boolean(currentPrize && currentPrize.remainingQuantity <= 0 && !isSpinning);
   const canRedrawAbsent = Boolean(
      !isSpinning && !isDrawingRequest && activeWinnerRecordId && activeWinnerId,
   );

   const localizedNotice = useMemo(() => {
      if (!notice) {
         return null;
      }

      return {
         kind: notice.kind,
         text: notice.text.startsWith('services.') ? translateRoot(notice.text) : notice.text,
      };
   }, [notice, translateRoot]);

   function handlePrizeChange(e: React.ChangeEvent<HTMLSelectElement>) {
      setCurrentPrize(Number(e.target.value));
      e.currentTarget.blur();
   }

   function handleSyncGame() {
      if (activeGameId && isLuckyDrawGame) {
         void loadGameData(activeGameId);
      }
   }

   function handleStartDraw() {
      void startDraw();
   }

   function handleRedrawAbsent() {
      void redrawAbsentWinner();
   }

   async function handleLogout() {
      cleanupRealtime();
      await useServicesAccountLogout();
      setUnauthenticated();
      router.replace(ROUTE.AUTHORIZE.LOGIN);
      router.refresh();
   }

   return {
      param: {
         hideHud,
         isLuckyDrawGame,
         prizes,
         currentPrizeIndex,
         currentPrizeDone,
         wonByPrize,
         busy,
         isSpinning,
         isDrawingRequest,
         isLoadingGame: isLoadingGame || isLoadingAssignments,
         stoppedReels,
         winnerLength: winnerId.length,
         activeWinnerId,
         canRedrawAbsent,
         drawMode,
         notice: localizedNotice,
      },
      func: {
         translate,
         clearNotice,
         handlePrizeChange,
         handleSyncGame,
         setDrawMode,
         handleStartDraw,
         handleManualStop,
         handleRedrawAbsent,
         handleLogout,
      },
   };
}
