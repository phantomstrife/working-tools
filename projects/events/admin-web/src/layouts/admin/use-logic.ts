import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useTranslate } from '@admin-web/locale';
import { ROUTE } from '@admin-web/routes/constants';
import { useServicesAccountLogout } from '@admin-web/services/account/logout';
import { useServicesAccountRead } from '@admin-web/services/account/read';

import type * as Types from './type';

export function useLogic(userMenuRef: React.RefObject<HTMLDivElement | null>) {
   const router = useRouter();

   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
   const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
   const [isLoggingOut, setIsLoggingOut] = useState(false);
   const [account, setAccount] = useState<Types.Account | null>(null);

   const { translate } = useTranslate({
      prefix: 'layouts.admin',
   });

   useEffect(() => {
      let active = true;

      void (async () => {
         const serviceAccount = await useServicesAccountRead();

         if (!active || serviceAccount.error) {
            return;
         }

         setAccount(serviceAccount.data);
      })();

      return () => {
         active = false;
      };
   }, []);

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

   const handleToggleUserMenu = () => {
      setIsUserMenuOpen((prev) => !prev);
   };

   const handleLogout = async () => {
      if (isLoggingOut) {
         return;
      }

      setIsLoggingOut(true);
      await useServicesAccountLogout();
      router.replace(ROUTE.AUTHORIZE.LOGIN);
      router.refresh();
   };

   return {
      param: {
         isSidebarOpen,
         isUserMenuOpen,
         isLoggingOut,
         account,
      },
      func: {
         translate,
         setIsSidebarOpen,
         setIsUserMenuOpen,
         handleToggleUserMenu,
         handleLogout,
      },
   };
}
