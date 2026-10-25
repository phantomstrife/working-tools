import { CompanyInfoCard } from '@admin-web/features/company/info-card';

import { useLogic } from './use-logic';

interface Params {
   companyId: string;
}

export const PageAdminHome: Router.Page<Params> = async ({ params }) => {
   const { companyId } = await params;
   const { company } = await useLogic(companyId);

   if (company.error === true) {
      return company.message;
   }

   return <CompanyInfoCard company={company.data} />;
};
