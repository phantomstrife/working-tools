import { createClient } from '@supabase/supabase-js';

import { SUPABASE } from './constants';

import type * as Types from './type';

export const getTokenClient: Types.Get_Token_Client = (accessToken) => {
   return createClient<Types.Database>(SUPABASE.URL, SUPABASE.ANON_KEY, {
      global: {
         headers: {
            Authorization: `Bearer ${accessToken}`,
         },
      },
      auth: {
         autoRefreshToken: false,
         persistSession: false,
         detectSessionInUrl: false,
      },
   });
};

