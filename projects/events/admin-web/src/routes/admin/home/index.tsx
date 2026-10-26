import { CompanyInfoCard } from '@admin-web/features/company/info-card';
import { NotFound } from '@admin-web/components/not-found';

import { useLogic } from './use-logic';

interface Params {
   companyId: string;
}

export const PageAdminHome: AdminWeb.Router.Page<Params> = async ({ params }) => {
   const { companyId } = await params;
   const { param } = await useLogic(companyId);

   if (param.serviceCompanyRead.error) {
      return (
         <NotFound
            title={param.serviceCompanyRead.message}
            description="Try adjusting your search criteria or add a new company to get started."
         />
      );
   }

   return <CompanyInfoCard company={param.serviceCompanyRead.data.company} />;
};
