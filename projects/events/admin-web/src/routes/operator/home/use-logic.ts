import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useDeepState } from '@admin-web/hooks/deep-state';
import { useTranslate } from '@admin-web/locale';
import { ROUTE } from '@admin-web/routes/constants';
import { useServicesAccountRead } from '@admin-web/services/account/read';
import { useServicesGameAssignmentSearch } from '@admin-web/services/game/assignment-search';
import { useStoreSession } from '@admin-web/stores/session';

import type * as Types from './type';

export function useLogic() {
   const router = useRouter();

   const { translate } = useTranslate({
      prefix: 'features.operator.selector',
   });

   const setAuthenticated = useStoreSession((store) => store.setAuthenticated);
   const setAssignments = useStoreSession((store) => store.setAssignments);
   const setUnauthenticated = useStoreSession((store) => store.setUnauthenticated);

   const [state, setState] = useDeepState<Types.State>({
      isLoading: true,
      events: [],
      selectedEventId: '',
      selectedGameId: '',
   });

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

         const assignmentsResult = await useServicesGameAssignmentSearch({
            accountId: serviceAccount.data.id,
            role: serviceAccount.data.role,
            companyId: serviceAccount.data.company_id,
         });

         if (!active) {
            return;
         }

         if (assignmentsResult.error) {
            setState({
               isLoading: false,
               events: [],
               selectedEventId: '',
               selectedGameId: '',
            });
            return;
         }

         const events = assignmentsResult.data;
         setAssignments(events);

         const assignedGames = events.flatMap((event) => event.games);

         if (assignedGames.length === 1) {
            router.replace(ROUTE.OPERATOR.GAME(assignedGames[0].id));
            return;
         }

         const firstEvent = events[0] ?? null;
         const firstGame = firstEvent?.games[0] ?? null;

         setState({
            isLoading: false,
            events,
            selectedEventId: firstEvent?.id ?? '',
            selectedGameId: firstGame?.id ?? '',
         });
      })();

      return () => {
         active = false;
      };
   }, [router, setAssignments, setAuthenticated, setState, setUnauthenticated]);

   const selectedEvent = state.events.find((item) => item.id === state.selectedEventId) ?? null;
   const games = selectedEvent?.games ?? [];

   const handleEventChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
      const nextEventId = event.target.value;
      const targetEvent = state.events.find((item) => item.id === nextEventId) ?? null;

      setState({
         selectedEventId: nextEventId,
         selectedGameId: targetEvent?.games[0]?.id ?? '',
      });
   };

   const handleGameChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
      setState(event.target.value, 'selectedGameId');
   };

   const handleOpenGame = (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!state.selectedGameId) {
         return;
      }

      router.push(ROUTE.OPERATOR.GAME(state.selectedGameId));
   };

   return {
      state,
      param: {
         games,
         isSubmitDisabled: state.isLoading || !state.selectedGameId,
      },
      func: {
         translate,
         handleEventChange,
         handleGameChange,
         handleOpenGame,
      },
   };
}
