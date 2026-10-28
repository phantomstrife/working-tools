import { useCallback, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { useTranslate } from '@admin-web/locale';
import { ROUTE } from '@admin-web/routes/constants';
import { useServicesAccountLogout } from '@admin-web/services/account/logout';
import { useServicesAccountRead } from '@admin-web/services/account/read';
import { useServicesGameAssignmentSearch } from '@admin-web/services/game/assignment-search';
import { useStoreSession } from '@admin-web/stores/session';

import type * as Types from './type';

export function useLogic() {
   const router = useRouter();
   const pathname = usePathname();

   const { translate } = useTranslate({
      prefix: 'layouts.venue',
   });

   const account = useStoreSession((store) => store.account);
   const events = useStoreSession((store) => store.events);
   const selectedEventId = useStoreSession((store) => store.selectedEventId);
   const selectedGameId = useStoreSession((store) => store.selectedGameId);
   const isLoadingAssignments = useStoreSession((store) => store.isLoadingAssignments);
   const setAuthenticated = useStoreSession((store) => store.setAuthenticated);
   const setAssignments = useStoreSession((store) => store.setAssignments);
   const setLoadingAssignments = useStoreSession((store) => store.setLoadingAssignments);
   const selectEvent = useStoreSession((store) => store.selectEvent);
   const selectGame = useStoreSession((store) => store.selectGame);
   const setUnauthenticated = useStoreSession((store) => store.setUnauthenticated);

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

   const canSwitchModes = account?.role === 'SUPER_ADMIN' || account?.role === 'ADMIN';
   const dashboardPath =
      account?.role === 'SUPER_ADMIN'
         ? ROUTE.SUPER_ADMIN.HOME
         : account?.role === 'ADMIN' && account.company_id
           ? ROUTE.ADMIN.HOME(account.company_id)
           : '';

   const handleEventChange: Types.Handle_Select_Change = (event) => {
      selectEvent(event.target.value);
   };

   const handleGameChange: Types.Handle_Select_Change = (event) => {
      selectGame(event.target.value);
   };

   const handleLogout = async () => {
      await useServicesAccountLogout();
      setUnauthenticated();
      router.replace(ROUTE.AUTHORIZE.LOGIN);
      router.refresh();
   };

   const handleNavigateMode = (path: string) => {
      router.push(path);
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
         currentPath: pathname,
         canSwitchModes,
         dashboardPath,
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

