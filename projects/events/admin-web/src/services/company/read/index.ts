'use server';

import { getServerClient } from '@admin-web/adapters/supabase/server';
import { trycatchAsync } from '@admin-web/utilities/trycatch';

import type * as Types from './type';

export const useServicesCompanyRead: Types.Service = async (request) => {
   const { id } = request;

   const result = await trycatchAsync(async () => {
      const supabase = await getServerClient();
      const company = await supabase.from('companies').select('*').eq('id', id).single();

      if (!company.data) {
         throw new Error('services.company.not_found');
      }

      return {
         company: company.data,
      };
   });

   return result;
};
