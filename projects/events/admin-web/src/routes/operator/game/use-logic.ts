import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { useTranslate } from '@admin-web/locale';
import { ROUTE } from '@admin-web/routes/constants';
import { useServicesAccountRead } from '@admin-web/services/account/read';
import { useServicesGameAssignmentSearch } from '@admin-web/services/game/assignment-search';
import { useStoreLuckyDraw } from '@admin-web/stores/lucky-draw';
import { useStoreSession } from '@admin-web/stores/session';

import type * as Types from './type';

export function useLogic() {
   const router = useRouter();
   const params = useParams<Types.Route_Params>();
   const gameId = params?.gameId ?? '';

   const { translate } = useTranslate({
      prefix: 'features.operator.placeholder',
   });

   const events = useStoreSession((store) => store.events);
   const setAuthenticated = useStoreSession((store) => store.setAuthenticated);
   const setAssignments = useStoreSession((store) => store.setAssignments);
   const setLoadingAssignments = useStoreSession((store) => store.setLoadingAssignments);
   const selectEvent = useStoreSession((store) => store.selectEvent);
   const selectGame = useStoreSession((store) => store.selectGame);
   const setUnauthenticated = useStoreSession((store) => store.setUnauthenticated);

   const loadGameData = useStoreLuckyDraw((store) => store.loadGameData);
   const cleanupRealtime = useStoreLuckyDraw((store) => store.cleanupRealtime);

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
         setLoadingAssignments(true);

         const assignmentsResult = await useServicesGameAssignmentSearch({
            accountId: serviceAccount.data.id,
            role: serviceAccount.data.role,
            companyId: serviceAccount.data.company_id,
         });

         if (!active) {
            return;
         }

         if (assignmentsResult.error) {
            setLoadingAssignments(false);
            return;
         }

         const assignedEvents = assignmentsResult.data;
         setAssignments(assignedEvents);

         const matchedEvent = assignedEvents.find((event) =>
            event.games.some((game) => game.id === gameId),
         );

         if (!matchedEvent) {
            router.replace(ROUTE.OPERATOR.HOME);
            return;
         }

         selectEvent(matchedEvent.id);
         selectGame(gameId);
      })();

      return () => {
         active = false;
      };
   }, [
      gameId,
      router,
      selectEvent,
      selectGame,
      setAssignments,
      setAuthenticated,
      setLoadingAssignments,
      setUnauthenticated,
   ]);

   const selectedEvent = events.find((event) => event.games.some((game) => game.id === gameId)) ?? null;
   const selectedGame = selectedEvent?.games.find((game) => game.id === gameId) ?? null;
   const gameType = selectedGame?.game_type ?? 'LUCKY_DRAW';

   useEffect(() => {
      if (gameId && gameType === 'LUCKY_DRAW') {
         void loadGameData(gameId);
      } else {
         void loadGameData('');
      }

      return () => {
         cleanupRealtime();
      };
   }, [cleanupRealtime, gameId, gameType, loadGameData]);

   return {
      param: {
         gameId,
         selectedEvent,
         selectedGame,
         gameType,
      },
      func: {
         translate,
      },
   };
}
