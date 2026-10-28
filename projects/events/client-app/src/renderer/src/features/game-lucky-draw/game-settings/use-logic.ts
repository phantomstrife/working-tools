import { useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';

import { useDeepState } from '@client-app/hooks/deep-state';
import { useTranslate } from '@client-app/locale';
import { ROUTE } from '@client-app/routes/constants';
import { useServicesAccountLogout } from '@client-app/services/account/logout';
import { useServicesGameAssignmentSearch } from '@client-app/services/game/assignment-search';
import { useStoreLuckyDraw } from '@client-app/store/lucky-draw';
import { DRAW_MODES } from '@client-app/store/lucky-draw/constants';
import { useStoreSession } from '@client-app/store/session';

import type * as Types from './type';

export { DRAW_MODES };

export function useLogic() {
   const navigate = useNavigate();

   const { translate } = useTranslate({
      prefix: 'features.operator.controls',
   });

   const { translate: translateRoot } = useTranslate({
      prefix: '',
   });

   const [state, setState] = useDeepState<Types.State>({
      collapsed: false,
   });

   const account = useStoreSession((s) => s.account);
   const events = useStoreSession((s) => s.events);
   const selectedEventId = useStoreSession((s) => s.selectedEventId);
   const selectedGameId = useStoreSession((s) => s.selectedGameId);
   const isLoadingAssignments = useStoreSession((s) => s.isLoadingAssignments);
   const setAssignments = useStoreSession((s) => s.setAssignments);
   const setLoadingAssignments = useStoreSession((s) => s.setLoadingAssignments);
   const selectEvent = useStoreSession((s) => s.selectEvent);
   const selectGame = useStoreSession((s) => s.selectGame);
   const setUnauthenticated = useStoreSession((s) => s.setUnauthenticated);

   const prizes = useStoreLuckyDraw((s) => s.prizes);
   const participants = useStoreLuckyDraw((s) => s.participants);
   const winners = useStoreLuckyDraw((s) => s.winners);
   const currentPrizeIndex = useStoreLuckyDraw((s) => s.currentPrizeIndex);
   const activeWinnerId = useStoreLuckyDraw((s) => s.activeWinnerId);
   const activeWinnerRecordId = useStoreLuckyDraw((s) => s.activeWinnerRecordId);
   const isSpinning = useStoreLuckyDraw((s) => s.isSpinning);
   const isDrawingRequest = useStoreLuckyDraw((s) => s.isDrawingRequest);
   const isLoadingGame = useStoreLuckyDraw((s) => s.isLoadingGame);
   const isRealtimeConnected = useStoreLuckyDraw((s) => s.isRealtimeConnected);
   const stoppedReels = useStoreLuckyDraw((s) => s.stoppedReels);
   const winnerId = useStoreLuckyDraw((s) => s.winnerId);
   const drawMode = useStoreLuckyDraw((s) => s.drawMode);
   const showWinners = useStoreLuckyDraw((s) => s.showWinners);
   const hideHud = useStoreLuckyDraw((s) => s.hideHud);
   const notice = useStoreLuckyDraw((s) => s.notice);

   const loadGameData = useStoreLuckyDraw((s) => s.loadGameData);
   const cleanupRealtime = useStoreLuckyDraw((s) => s.cleanupRealtime);
   const setCurrentPrize = useStoreLuckyDraw((s) => s.setCurrentPrize);
   const setDrawMode = useStoreLuckyDraw((s) => s.setDrawMode);
   const setShowWinners = useStoreLuckyDraw((s) => s.setShowWinners);
   const clearNotice = useStoreLuckyDraw((s) => s.clearNotice);
   const startDraw = useStoreLuckyDraw((s) => s.startDraw);
   const handleManualStop = useStoreLuckyDraw((s) => s.handleManualStop);
   const redrawAbsentWinner = useStoreLuckyDraw((s) => s.redrawAbsentWinner);

   const fetchAssignments = useCallback(async () => {
      if (!account) {
         return;
      }

      setLoadingAssignments(true);

      const serviceAssignmentSearch = await useServicesGameAssignmentSearch({
         accountId: account.id,
         role: account.role,
         companyId: account.company_id,
      });

      if (serviceAssignmentSearch.error) {
         setLoadingAssignments(false);
         return;
      }

      setAssignments(serviceAssignmentSearch.data);
   }, [account, setAssignments, setLoadingAssignments]);

   useEffect(() => {
      if (events.length === 0) {
         void fetchAssignments();
      }
   }, [events.length, fetchAssignments]);

   const selectedEvent = events.find((item) => item.id === selectedEventId) ?? null;
   const games = selectedEvent?.games ?? [];
   const selectedGame = games.find((item) => item.id === selectedGameId) ?? null;
   const isLuckyDrawGame = !selectedGame || selectedGame.game_type === 'LUCKY_DRAW';

   useEffect(() => {
      if (selectedGameId && isLuckyDrawGame) {
         void loadGameData(selectedGameId);
      } else {
         void loadGameData('');
      }

      return () => {
         cleanupRealtime();
      };
   }, [cleanupRealtime, isLuckyDrawGame, loadGameData, selectedGameId]);

   const hiddenTicketCode = isSpinning ? winnerId : null;

   const stats = useMemo(() => {
      const wonByPrize = new Map<string, number>();
      for (const w of winners) {
         if (w.ticketCode !== hiddenTicketCode) {
            wonByPrize.set(w.prizeId, (wonByPrize.get(w.prizeId) ?? 0) + 1);
         }
      }

      const totalWon = winners.filter((w) => w.ticketCode !== hiddenTicketCode).length;
      const eligibleCount = participants.filter(
         (p) => !p.isAbsentForfeited && (!p.hasWon || p.ticketCode === hiddenTicketCode),
      ).length;
      const totalPrizes = prizes.reduce((sum, p) => sum + p.totalQuantity, 0);

      return {
         wonByPrize,
         scanned: participants.length,
         eligible: eligibleCount,
         totalPrizes,
         totalWon,
      };
   }, [participants, prizes, winners, hiddenTicketCode]);

   const busy = isSpinning || isDrawingRequest || isLoadingGame || isLoadingAssignments;
   const currentPrize = prizes[currentPrizeIndex] ?? null;
   const currentPrizeDone = Boolean(currentPrize && currentPrize.remainingQuantity <= 0 && !isSpinning);
   const canRedrawAbsent = Boolean(!isSpinning && !isDrawingRequest && activeWinnerRecordId && activeWinnerId);

   const localizedNotice = useMemo(() => {
      if (!notice) {
         return null;
      }

      return {
         kind: notice.kind,
         text: notice.text.startsWith('services.') ? translateRoot(notice.text) : notice.text,
      };
   }, [notice, translateRoot]);

   function handleEventChange(e: React.ChangeEvent<HTMLSelectElement>) {
      selectEvent(e.target.value);
   }

   function handleGameChange(e: React.ChangeEvent<HTMLSelectElement>) {
      selectGame(e.target.value);
   }

   function handlePrizeChange(e: React.ChangeEvent<HTMLSelectElement>) {
      setCurrentPrize(Number(e.target.value));
   }

   function handleSyncGame() {
      void fetchAssignments();
      if (selectedGameId && isLuckyDrawGame) {
         void loadGameData(selectedGameId);
      }
   }

   function handleToggleWinners() {
      setShowWinners((v) => !v);
   }

   function handleStartDraw() {
      void startDraw();
   }

   function handleRedrawAbsent() {
      void redrawAbsentWinner();
   }

   function setCollapsed(collapsed: boolean) {
      setState(collapsed, 'collapsed');
   }

   function handleSwitchToGuard() {
      navigate(ROUTE.GUARD.HOME);
   }

   async function handleLogout() {
      cleanupRealtime();
      await useServicesAccountLogout();
      setUnauthenticated();
      navigate(ROUTE.AUTHORIZE.LOGIN, { replace: true });
   }

   return {
      param: {
         collapsed: state.collapsed,
         hideHud,
         account,
         isSuperAdmin: account?.role === 'SUPER_ADMIN',
         events,
         games,
         selectedEventId,
         selectedGameId,
         isLuckyDrawGame,
         prizes,
         currentPrizeIndex,
         currentPrize,
         currentPrizeDone,
         stats,
         busy,
         isSpinning,
         isDrawingRequest,
         isLoadingGame: isLoadingGame || isLoadingAssignments,
         isRealtimeConnected,
         stoppedReels,
         winnerLength: winnerId.length,
         activeWinnerId,
         canRedrawAbsent,
         drawMode,
         showWinners,
         notice: localizedNotice,
      },
      func: {
         translate,
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
         handleSwitchToGuard,
         handleLogout,
      },
   };
}
