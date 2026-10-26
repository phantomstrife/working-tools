import { getServerClient } from '@admin-web/adapters/supabase/server';
import { trycatchAsync } from '@admin-web/utilities/trycatch';

import type * as Types from './type';

export const useServicesUserRead: Types.Service = async () => {
   const result = await trycatchAsync(async () => {
      const supabase = await getServerClient();
      const auth = await supabase.auth.getUser();
      const user = auth.data.user;

      if (!user) {
         throw new Error('services.user.unauthenticated');
      }

      const role = user.app_metadata.role as AdminWeb.Database.Account_Role;
      const companyId = user.app_metadata.company_id as string;

      return {
         role,
         companyId,
      };
   });

   return result;
};
