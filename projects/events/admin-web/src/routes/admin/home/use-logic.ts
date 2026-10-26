import { useServicesCompanyRead } from '@admin-web/services/company/read';

export async function useLogic(companyId: string) {
   const serviceCompanyRead = await useServicesCompanyRead({
      id: companyId,
   });

   return {
      param: {
         serviceCompanyRead,
      },
   };
}
