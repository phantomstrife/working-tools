import { createClient } from '@supabase/supabase-js';

import { SUPABASE } from './constants';
import { secureStorage } from './storage';

import type * as Types from './type';

const getClient: Types.Get_Client = () => {
   return createClient<Types.Database>(SUPABASE.URL, SUPABASE.ANON_KEY, {
      auth: {
         storage: secureStorage,
         storageKey: SUPABASE.STORAGE_KEY,
         persistSession: true,
         autoRefreshToken: true,
         detectSessionInUrl: false,
      },
   });
};

export const supabase = getClient();
