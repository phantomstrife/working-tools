import { useCallback } from 'react';

import { useTranslate } from '@admin-web/locale';
import { useServicesGameAssignmentSearch } from '@admin-web/services/game/assignment-search';
import { useStoreSession } from '@admin-web/stores/session';

export function useLogic() {
   const { translate } = useTranslate({
      prefix: 'features.guard.check_in',
   });

   const { translate: translateVenue } = useTranslate({
      prefix: 'layouts.venue',
   });

   const status = useStoreSession((store) => store.status);
   const account = useStoreSession((store) => store.account);
   const events = useStoreSession((store) => store.events);
   const selectedEventId = useStoreSession((store) => store.selectedEventId);
   const selectedGameId = useStoreSession((store) => store.selectedGameId);
   const isLoadingAssignments = useStoreSession((store) => store.isLoadingAssignments);
   const setAssignments = useStoreSession((store) => store.setAssignments);
   const setLoadingAssignments = useStoreSession((store) => store.setLoadingAssignments);
   const selectEvent = useStoreSession((store) => store.selectEvent);
   const selectGame = useStoreSession((store) => store.selectGame);

   const selectedEvent = events.find((item) => item.id === selectedEventId) ?? null;
   const games = selectedEvent?.games ?? [];
   const selectedGame = games.find((item) => item.id === selectedGameId) ?? null;

   const fetchAssignments = useCallback(async () => {
      if (!account) {
         return;
      }

      setLoadingAssignments(true);

      const serviceAssignmentSearch = await useServicesGameAssignmentSearch({
         accountId: account.id,
         role: account.role,
         companyId: account.company_id,
         gameType: 'LUCKY_DRAW',
      });

      if (serviceAssignmentSearch.error) {
         setLoadingAssignments(false);
         return;
      }

      setAssignments(serviceAssignmentSearch.data);
   }, [account, setAssignments, setLoadingAssignments]);

   const handleEventChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
      selectEvent(event.target.value);
   };

   const handleGameChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
      selectGame(event.target.value);
   };

   return {
      param: {
         events,
         games,
         selectedEventId,
         selectedGameId,
         selectedGame,
         isLoading: status === 'LOADING' || isLoadingAssignments,
      },
      func: {
         translate,
         translateVenue,
         fetchAssignments,
         handleEventChange,
         handleGameChange,
      },
   };
}
