import { useEffect, useMemo, useState } from 'react';
import { useDrawStore } from '@renderer/stores/lucky-draw';

import type { DrawMode } from '@renderer/stores/lucky-draw';

export type EventLoaderProps = {
   accountId: string;
};

export const DRAW_MODES: ReadonlyArray<DrawMode> = ['auto', 'manual', 'instant'];

export function useLogic(props: EventLoaderProps) {
   const { accountId } = props;
   const [collapsed, setCollapsed] = useState(false);

   const events = useDrawStore((s) => s.events);
   const games = useDrawStore((s) => s.games);
   const selectedEventId = useDrawStore((s) => s.selectedEventId);
   const selectedGameId = useDrawStore((s) => s.selectedGameId);
   const prizes = useDrawStore((s) => s.prizes);
   const participants = useDrawStore((s) => s.participants);
   const winners = useDrawStore((s) => s.winners);
   const currentPrizeIndex = useDrawStore((s) => s.currentPrizeIndex);
   const activeWinnerId = useDrawStore((s) => s.activeWinnerId);
   const activeWinnerRecordId = useDrawStore((s) => s.activeWinnerRecordId);

   const isSpinning = useDrawStore((s) => s.isSpinning);
   const isLoadingGame = useDrawStore((s) => s.isLoadingGame);
   const isRealtimeConnected = useDrawStore((s) => s.isRealtimeConnected);
   const stoppedReels = useDrawStore((s) => s.stoppedReels);
   const winnerId = useDrawStore((s) => s.winnerId);
   const drawMode = useDrawStore((s) => s.drawMode);
   const showWinners = useDrawStore((s) => s.showWinners);
   const hideHud = useDrawStore((s) => s.hideHud);
   const notice = useDrawStore((s) => s.notice);

   const loadEvents = useDrawStore((s) => s.loadEvents);
   const selectEvent = useDrawStore((s) => s.selectEvent);
   const loadGameData = useDrawStore((s) => s.loadGameData);
   const cleanupRealtime = useDrawStore((s) => s.cleanupRealtime);
   const setCurrentPrize = useDrawStore((s) => s.setCurrentPrize);
   const setDrawMode = useDrawStore((s) => s.setDrawMode);
   const setShowWinners = useDrawStore((s) => s.setShowWinners);
   const clearNotice = useDrawStore((s) => s.clearNotice);
   const startDraw = useDrawStore((s) => s.startDraw);
   const handleManualStop = useDrawStore((s) => s.handleManualStop);
   const redrawAbsentWinner = useDrawStore((s) => s.redrawAbsentWinner);

   useEffect(() => {
      loadEvents();
      return () => {
         cleanupRealtime();
      };
   }, [loadEvents, cleanupRealtime]);

   const hiddenTicketCode = isSpinning ? winnerId : null;

   const stats = useMemo(() => {
      const wonByPrize = new Map<string, number>();
      for (const w of winners) {
         if (w.ticketCode !== hiddenTicketCode) {
            wonByPrize.set(w.prizeId, (wonByPrize.get(w.prizeId) ?? 0) + 1);
         }
      }

      const totalWon = winners.filter((w) => w.ticketCode !== hiddenTicketCode).length;
      const eligibleCount = participants.filter((p) => !p.hasWon || p.id === hiddenTicketCode).length;
      const totalPrizes = prizes.reduce((sum, p) => sum + p.totalQuantity, 0);

      return {
         wonByPrize,
         scanned: participants.length,
         eligible: eligibleCount,
         totalPrizes,
         totalWon,
      };
   }, [participants, prizes, winners, hiddenTicketCode]);

   const busy = isSpinning || isLoadingGame;
   const currentPrize = prizes[currentPrizeIndex] ?? null;
   const currentPrizeDone = Boolean(currentPrize && currentPrize.remainingQuantity <= 0 && !isSpinning);
   const canRedrawAbsent = Boolean(!isSpinning && activeWinnerRecordId && activeWinnerId);

   function handleEventChange(e: React.ChangeEvent<HTMLSelectElement>) {
      selectEvent(e.target.value);
   }

   function handleGameChange(e: React.ChangeEvent<HTMLSelectElement>) {
      loadGameData(e.target.value);
   }

   function handlePrizeChange(e: React.ChangeEvent<HTMLSelectElement>) {
      setCurrentPrize(Number(e.target.value));
   }

   function handleSyncGame() {
      if (selectedGameId) {
         loadGameData(selectedGameId);
      }
   }

   function handleToggleWinners() {
      setShowWinners((v) => !v);
   }

   function handleStartDraw() {
      startDraw(accountId);
   }

   function handleRedrawAbsent() {
      redrawAbsentWinner(accountId);
   }

   return {
      param: {
         collapsed,
         hideHud,
         events,
         games,
         selectedEventId,
         selectedGameId,
         prizes,
         currentPrizeIndex,
         currentPrize,
         currentPrizeDone,
         stats,
         busy,
         isSpinning,
         isLoadingGame,
         isRealtimeConnected,
         stoppedReels,
         winnerLength: winnerId.length,
         activeWinnerId,
         canRedrawAbsent,
         drawMode,
         showWinners,
         notice,
      },
      func: {
         setCollapsed,
         clearNotice,
         handleEventChange,
         handleGameChange,
         handlePrizeChange,
         handleSyncGame,
         handleToggleWinners,
         setDrawMode,
         handleStartDraw,
         handleManualStop,
         handleRedrawAbsent,
      },
   };
}

