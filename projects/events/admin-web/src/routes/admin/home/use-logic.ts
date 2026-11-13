import { useServicesCompanyRead } from '@admin-web/services/company/read';
import { useServicesCompanySearch } from '@admin-web/services/company/search';
import { useServicesEventGetGames } from '@admin-web/services/event/get-games';
import { useServicesUserRead } from '@admin-web/services/user/read/server';

export async function useLogic(companyId: string) {
   const serviceUserRead = await useServicesUserRead();
   const isSuperAdmin = !serviceUserRead.error && serviceUserRead.data.role === 'SUPER_ADMIN';

   const [serviceCompanyRead, serviceEventGetGames, serviceCompanySearch] = await Promise.all([
      useServicesCompanyRead({ id: companyId }),
      useServicesEventGetGames({ companyId }),
      isSuperAdmin ? useServicesCompanySearch() : Promise.resolve(null),
   ]);

   const companies =
      serviceCompanySearch && !serviceCompanySearch.error ? serviceCompanySearch.data.companies : [];

   return {
      param: {
         isSuperAdmin,
         companies,
         serviceCompanyRead,
         serviceEventGetGames,
      },
   };
}
