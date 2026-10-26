import { createClient } from '@supabase/supabase-js';

import { SUPABASE } from './constants';

import type * as Types from './type';

export const getAdminClient: Types.Get_Admin_Client = () => {
   if (!SUPABASE.SERVICE_ROLE_KEY) {
      throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable.');
   }

   return createClient<Types.Database>(SUPABASE.URL, SUPABASE.SERVICE_ROLE_KEY, {
      auth: {
         autoRefreshToken: false,
         persistSession: false,
      },
   });
};
