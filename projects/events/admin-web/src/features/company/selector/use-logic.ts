import { useRouter } from 'next/navigation';

import { useTranslate } from '@admin-web/locale';
import { ROUTE } from '@admin-web/routes/constants';

import type * as Types from './type';

export function useLogic(properties: Types.Properties) {
   const { currentCompanyId, companies } = properties;
   const router = useRouter();

   const { translate } = useTranslate({
      prefix: 'features.company.selector',
   });

   const handleChangeCompany = (event: React.ChangeEvent<HTMLSelectElement>) => {
      const nextCompanyId = event.target.value;

      if (nextCompanyId && nextCompanyId !== currentCompanyId) {
         router.push(ROUTE.ADMIN.HOME(nextCompanyId));
      }
   };

   return {
      param: {
         currentCompanyId,
         companies,
      },
      func: {
         translate,
         handleChangeCompany,
      },
   };
}
