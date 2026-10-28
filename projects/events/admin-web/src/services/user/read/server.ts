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

      const account = await supabase
         .from('accounts')
         .select('role, company_id, is_active')
         .eq('id', user.id)
         .single();

      if (account.error || !account.data || !account.data.is_active) {
         throw new Error('services.user.unauthenticated');
      }

      return {
         role: account.data.role,
         companyId: account.data.company_id || '',
      };
   });

   return result;
};
