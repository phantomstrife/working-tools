import { getServerClient } from '@admin-web/adapters/supabase/server';

import type * as Types from './type';

export const useServicesCompanyRead: Types.Service = async (request) => {
   const { id } = request;

   const supabase = await getServerClient();
   const response = await supabase.from('companies').select('*').eq('id', id).single();

   if (response.data) {
      return {
         error: false,
         data: response.data,
      };
   }

   return {
      error: true,
      data: null,
      message: 'company_not_found',
   };
};
