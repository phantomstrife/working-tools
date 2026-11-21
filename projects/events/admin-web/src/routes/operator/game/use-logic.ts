import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { useTranslate } from '@admin-web/locale';
import { ROUTE } from '@admin-web/routes/constants';
import { useServicesAccountRead } from '@admin-web/services/account/read';
import { useServicesGameAssignmentSearch } from '@admin-web/services/game/assignment-search';
import { useStoreLuckyDraw } from '@admin-web/stores/lucky-draw';
import { useStoreSession } from '@admin-web/stores/session';

import type * as Types from './type';

interface GameResolution {
   gameId: string;
   status: 'ready' | 'error';
   game: AdminWeb.Features.Game.AssignedGame | null;
   errorMessage: string;
}

export function useLogic() {
   const router = useRouter();
   const params = useParams<Types.Route_Params>();
   const gameId = params?.gameId ?? '';

   const { translate } = useTranslate({
      prefix: 'features.operator.placeholder',
   });

   const { translate: translateRoot } = useTranslate({
      prefix: '',
   });

   const [resolution, setResolution] = useState<GameResolution | null>(null);

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
         if (!gameId) {
            setResolution({
               gameId,
               status: 'error',
               game: null,
               errorMessage: 'services.game_lucky_draw.game_not_found',
            });
            return;
         }

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
            setResolution({
               gameId,
               status: 'error',
               game: null,
               errorMessage: assignmentsResult.message,
            });
            return;
         }

         const assignedEvents = assignmentsResult.data;
         setAssignments(assignedEvents);

         const matchedEvent = assignedEvents.find((event) =>
            event.games.some((game) => game.id === gameId),
         );
         const matchedGame = matchedEvent?.games.find((game) => game.id === gameId) ?? null;

         if (!matchedEvent || !matchedGame) {
            setResolution({
               gameId,
               status: 'error',
               game: null,
               errorMessage: 'services.game_lucky_draw.game_not_found',
            });
            router.replace(ROUTE.OPERATOR.HOME);
            return;
         }

         selectEvent(matchedEvent.id);
         selectGame(gameId);
         setResolution({
            gameId,
            status: 'ready',
            game: matchedGame,
            errorMessage: '',
         });
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

   const isCurrentGameResolved = resolution?.gameId === gameId;
   const resolvedGame =
      isCurrentGameResolved && resolution.status === 'ready' && resolution.game?.id === gameId
         ? resolution.game
         : null;
   const isResolving = !isCurrentGameResolved;
   const rawErrorMessage =
      isCurrentGameResolved && resolution.status === 'error' ? resolution.errorMessage : '';
   const errorMessage = rawErrorMessage.startsWith('services.')
      ? translateRoot(rawErrorMessage)
      : rawErrorMessage;
   const gameType = resolvedGame?.game_type ?? null;

   useEffect(() => {
      if (resolvedGame && resolvedGame.game_type === 'LUCKY_DRAW') {
         void loadGameData(resolvedGame.id);
      } else {
         void loadGameData('');
      }

      return () => {
         cleanupRealtime();
      };
   }, [cleanupRealtime, loadGameData, resolvedGame]);

   return {
      param: {
         gameId,
         resolvedGame,
         isResolving,
         errorMessage,
         gameType,
      },
      func: {
         translate,
      },
   };
}
