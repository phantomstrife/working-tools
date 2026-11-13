import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { useTranslate } from '@admin-web/locale';
import { ROUTE } from '@admin-web/routes/constants';
import { useServicesAccountLogout } from '@admin-web/services/account/logout';
import { useServicesAccountRead } from '@admin-web/services/account/read';
import { useServicesGameAssignmentSearch } from '@admin-web/services/game/assignment-search';
import { useStoreSession } from '@admin-web/stores/session';

export function useLogic(userMenuRef: React.RefObject<HTMLDivElement | null>) {
   const router = useRouter();
   const pathname = usePathname();
   const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

   const { translate } = useTranslate({
      prefix: 'layouts.venue',
   });

   const account = useStoreSession((store) => store.account);
   const setAuthenticated = useStoreSession((store) => store.setAuthenticated);
   const setAssignments = useStoreSession((store) => store.setAssignments);
   const setLoadingAssignments = useStoreSession((store) => store.setLoadingAssignments);
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

   useEffect(() => {
      if (!isUserMenuOpen) {
         return;
      }

      const handlePointerDown = (event: MouseEvent) => {
         if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
            setIsUserMenuOpen(false);
         }
      };

      const handleKeyDown = (event: KeyboardEvent) => {
         if (event.key === 'Escape') {
            setIsUserMenuOpen(false);
         }
      };

      document.addEventListener('mousedown', handlePointerDown);
      document.addEventListener('keydown', handleKeyDown);

      return () => {
         document.removeEventListener('mousedown', handlePointerDown);
         document.removeEventListener('keydown', handleKeyDown);
      };
   }, [isUserMenuOpen, userMenuRef]);

   const canSwitchModes = account?.role === 'SUPER_ADMIN' || account?.role === 'ADMIN';
   const dashboardPath =
      account?.role === 'SUPER_ADMIN'
         ? ROUTE.SUPER_ADMIN.HOME
         : account?.role === 'ADMIN' && account.company_id
           ? ROUTE.ADMIN.HOME(account.company_id)
           : '';

   const handleToggleUserMenu = () => {
      setIsUserMenuOpen((prev) => !prev);
   };

   const handleLogout = async () => {
      setIsUserMenuOpen(false);
      await useServicesAccountLogout();
      setUnauthenticated();
      router.replace(ROUTE.AUTHORIZE.LOGIN);
      router.refresh();
   };

   const handleNavigateMode = (path: string) => {
      setIsUserMenuOpen(false);
      router.push(path);
   };

   return {
      param: {
         account,
         isUserMenuOpen,
         currentPath: pathname,
         canSwitchModes,
         dashboardPath,
      },
      func: {
         translate,
         handleToggleUserMenu,
         handleLogout,
         handleNavigateMode,
      },
   };
}

