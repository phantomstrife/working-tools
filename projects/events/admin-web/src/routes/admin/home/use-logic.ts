import { useServicesCompanyRead } from '@admin-web/services/company/read';
import { useServicesEventGetGames } from '@admin-web/services/event/get-games';

export async function useLogic(companyId: string) {
   const serviceCompanyRead = await useServicesCompanyRead({ id: companyId });
   const serviceEventGetGames = await useServicesEventGetGames();

   return {
      param: {
         serviceCompanyRead,
         serviceEventGetGames,
      },
   };
}
