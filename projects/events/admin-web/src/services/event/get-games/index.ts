'use server';

import { getServerClient } from '@admin-web/adapters/supabase/server';
import { useServicesUserRead } from '@admin-web/services/user/read/server';
import { trycatchAsync } from '@admin-web/utilities/trycatch';

import type * as Types from './type';

export const useServicesEventGetGames: Types.Service = async () => {
   const result = await trycatchAsync(async () => {
      const serviceUserRead = await useServicesUserRead();

      if (serviceUserRead.error) {
         throw new Error(serviceUserRead.message);
      }

      const companyId = serviceUserRead.data.companyId;

      const supabase = await getServerClient();
      const events = await supabase.from('events').select('*, games(*)').eq('company_id', companyId);

      if (events.error) {
         throw new Error(events.error.message);
      }

      return {
         event: events.data,
      };
   });

   return result;
};
