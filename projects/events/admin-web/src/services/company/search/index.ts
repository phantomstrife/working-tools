'use server';

import { getServerClient } from '@admin-web/adapters/supabase/server';
import { useServicesUserRead } from '@admin-web/services/user/read/server';
import { trycatchAsync } from '@admin-web/utilities/trycatch';

import type * as Types from './type';

export const useServicesCompanySearch: Types.Service = async () => {
   const result = await trycatchAsync(async () => {
      const serviceUserRead = await useServicesUserRead();

      if (serviceUserRead.error) {
         throw new Error(serviceUserRead.message);
      }

      if (serviceUserRead.data.role !== 'SUPER_ADMIN') {
         return {
            companies: [],
         };
      }

      const supabase = await getServerClient();
      const companies = await supabase.from('companies').select('id, name').order('name', { ascending: true });

      if (companies.error) {
         throw new Error(companies.error.message);
      }

      return {
         companies: companies.data ?? [],
      };
   });

   return result;
};
