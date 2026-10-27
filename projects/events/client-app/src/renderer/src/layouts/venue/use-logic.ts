import { useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { useTranslate } from '@client-app/locale';
import { ROUTE } from '@client-app/routes/constants';
import { useServicesAccountLogout } from '@client-app/services/account/logout';
import { useServicesGameAssignmentSearch } from '@client-app/services/game/assignment-search';
import { useStoreSession } from '@client-app/store/session';

import type * as Types from './type';

export function useLogic() {
   const navigate = useNavigate();
   const location = useLocation();

   const { translate } = useTranslate({
      prefix: 'layouts.venue',
   });

   const account = useStoreSession((store) => store.account);
   const events = useStoreSession((store) => store.events);
   const selectedEventId = useStoreSession((store) => store.selectedEventId);
   const selectedGameId = useStoreSession((store) => store.selectedGameId);
   const isLoadingAssignments = useStoreSession((store) => store.isLoadingAssignments);
   const setAssignments = useStoreSession((store) => store.setAssignments);
   const setLoadingAssignments = useStoreSession((store) => store.setLoadingAssignments);
   const selectEvent = useStoreSession((store) => store.selectEvent);
   const selectGame = useStoreSession((store) => store.selectGame);
   const setUnauthenticated = useStoreSession((store) => store.setUnauthenticated);

   const fetchAssignments = useCallback(async () => {
      if (!account) {
         return;
      }

      setLoadingAssignments(true);

      const serviceAssignmentSearch = await useServicesGameAssignmentSearch({
         accountId: account.id,
         role: account.role,
         gameType: 'LUCKY_DRAW',
      });

      if (serviceAssignmentSearch.error) {
         setLoadingAssignments(false);
         return;
      }

      setAssignments(serviceAssignmentSearch.data);
   }, [account, setAssignments, setLoadingAssignments]);

   useEffect(() => {
      void fetchAssignments();
   }, [fetchAssignments]);

   const selectedEvent = events.find((item) => item.id === selectedEventId) ?? null;
   const games = selectedEvent?.games ?? [];
   const selectedGame = games.find((item) => item.id === selectedGameId) ?? null;

   const handleEventChange: Types.Handle_Select_Change = (event) => {
      selectEvent(event.target.value);
   };

   const handleGameChange: Types.Handle_Select_Change = (event) => {
      selectGame(event.target.value);
   };

   const handleLogout = async () => {
      await useServicesAccountLogout();
      setUnauthenticated();
      navigate(ROUTE.AUTHORIZE.LOGIN, { replace: true });
   };

   const handleNavigateMode = (path: string) => {
      navigate(path);
   };

   return {
      param: {
         account,
         events,
         games,
         selectedEventId,
         selectedGameId,
         selectedGame,
         isLoadingAssignments,
         currentPath: location.pathname,
         isSuperAdmin: account?.role === 'SUPER_ADMIN',
      },
      func: {
         translate,
         fetchAssignments,
         handleEventChange,
         handleGameChange,
         handleLogout,
         handleNavigateMode,
      },
   };
}

