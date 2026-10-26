import { CompanyInfoCard } from '@admin-web/features/company/info-card';
import { EventGameOverview } from '@admin-web/features/event/overview';
import { NotFound } from '@admin-web/components/not-found';

import { useLogic } from './use-logic';
import { useStyle } from './use-style';

import type * as Types from './type';

export const PageAdminHome: AdminWeb.Router.Page<Types.Params> = async ({ params }) => {
   const { companyId } = await params;

   const { param } = await useLogic(companyId);
   const { root } = useStyle;

   if (param.serviceCompanyRead.error) {
      return <NotFound error={param.serviceCompanyRead.message} />;
   }

   return (
      <div className={root.wrapper}>
         <CompanyInfoCard company={param.serviceCompanyRead.data.company} />
         {!param.serviceEventGetGames.error && <EventGameOverview events={param.serviceEventGetGames.data.event} />}
      </div>
   );
};
