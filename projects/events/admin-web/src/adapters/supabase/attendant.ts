import { createClient } from '@supabase/supabase-js';

import { SUPABASE } from './constants';

import type * as Types from './type';

export const getAttendantClient: Types.Get_Attendant_Client = (attendantId) => {
   return createClient<Types.Database>(SUPABASE.URL, SUPABASE.ANON_KEY, {
      global: {
         headers: {
            'x-attendant-id': attendantId,
         },
      },
      auth: {
         autoRefreshToken: false,
         persistSession: false,
         detectSessionInUrl: false,
      },
   });
};
