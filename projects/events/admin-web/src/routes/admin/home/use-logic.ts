import { useServicesCompanyRead } from '@admin-web/services/company/read';

export async function useLogic(companyId: string) {
   const company = await useServicesCompanyRead({
      id: companyId,
   });

   return {
      company,
   };
}
