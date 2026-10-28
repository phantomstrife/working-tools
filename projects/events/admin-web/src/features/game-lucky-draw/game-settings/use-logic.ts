import { useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';

import { useDeepState } from '@admin-web/hooks/deep-state';
import { useTranslate } from '@admin-web/locale';
import { ROUTE } from '@admin-web/routes/constants';
import { useServicesAccountLogout } from '@admin-web/services/account/logout';
import { useServicesAccountRead } from '@admin-web/services/account/read';
import { useServicesGameAssignmentSearch } from '@admin-web/services/game/assignment-search';
import { useStoreLuckyDraw } from '@admin-web/stores/lucky-draw';
import { DRAW_MODES } from '@admin-web/stores/lucky-draw/constants';
import { useStoreSession } from '@admin-web/stores/session';

import type * as Types from './type';

export { DRAW_MODES };

export function useLogic() {
   const router = useRouter();

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
   const setAuthenticated = useStoreSession((s) => s.setAuthenticated);
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

   useEffect(() => {
      let active = true;

      void (async () => {
         const serviceAccount = await useServicesAccountRead();
         if (!active) {
            return;
         }

         if (serviceAccount.error) {
            setUnauthenticated();
            router.replace(ROUTE.AUTHORIZE.LOGIN);
            return;
         }

         setAuthenticated(serviceAccount.data);
      })();

      return () => {
         active = false;
      };
   }, [router, setAuthenticated, setUnauthenticated]);

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
      if (account && events.length === 0) {
         void fetchAssignments();
      }
   }, [account, events.length, fetchAssignments]);

   const selectedEvent = events.find((item) => item.id === selectedEventId) ?? null;
   const games = selectedEvent?.games ?? [];
   const selectedGame = games.find((item) => item.id === selectedGameId) ?? null;
   const isLuckyDrawGame = !selectedGame || selectedGame.game_type === 'LUCKY_DRAW';

   const canSwitchModes = account?.role === 'SUPER_ADMIN' || account?.role === 'ADMIN';
   const dashboardPath =
      account?.role === 'SUPER_ADMIN'
         ? ROUTE.SUPER_ADMIN.HOME
         : account?.role === 'ADMIN' && account.company_id
           ? ROUTE.ADMIN.HOME(account.company_id)
           : '';

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
      router.push(ROUTE.GUARD.HOME);
   }

   function handleSwitchToDashboard() {
      if (dashboardPath) {
         router.push(dashboardPath);
      }
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
         collapsed: state.collapsed,
         hideHud,
         account,
         canSwitchModes,
         dashboardPath,
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
         handleSwitchToDashboard,
         handleLogout,
      },
   };
}

