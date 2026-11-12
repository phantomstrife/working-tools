import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { useTranslate } from '@admin-web/locale';
import { ROUTE } from '@admin-web/routes/constants';
import { useServicesAccountLogout } from '@admin-web/services/account/logout';
import { useServicesAccountRead } from '@admin-web/services/account/read';
import { useServicesCompanySearch } from '@admin-web/services/company/search';

import type * as Types from './type';

export function useLogic() {
   const router = useRouter();
   const pathname = usePathname();

   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
   const [isLoggingOut, setIsLoggingOut] = useState(false);
   const [account, setAccount] = useState<Types.Account | null>(null);
   const [companies, setCompanies] = useState<Types.Company[]>([]);

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

         if (serviceAccount.data.role !== 'SUPER_ADMIN') {
            return;
         }

         const serviceCompanies = await useServicesCompanySearch();

         if (active && !serviceCompanies.error) {
            setCompanies(serviceCompanies.data.companies);
         }
      })();

      return () => {
         active = false;
      };
   }, []);

   const isSuperAdmin = account?.role === 'SUPER_ADMIN';
   const currentCompanyId = pathname.match(/^\/admin\/([^/]+)/)?.[1] ?? '';

   const handleCompanyChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
      const companyId = event.target.value;

      if (companyId) {
         router.push(ROUTE.ADMIN.HOME(companyId));
      }
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
         isLoggingOut,
         account,
         companies,
         isSuperAdmin,
         currentCompanyId,
      },
      func: {
         translate,
         setIsSidebarOpen,
         handleCompanyChange,
         handleLogout,
      },
   };
}
