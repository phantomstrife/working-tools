import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

import { SUPABASE } from './constants';

import type * as Types from './type';

export const getServerClient: Types.Get_Server_Client = async () => {
   const storages = await cookies();

   return createServerClient<Types.Database>(SUPABASE.URL, SUPABASE.ANON_KEY, {
      cookies: {
         getAll() {
            return storages.getAll();
         },
         setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
               storages.set(name, value, options);
            });
         },
      },
   });
};
