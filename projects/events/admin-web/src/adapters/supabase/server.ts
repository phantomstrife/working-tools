import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

import { SUPABASE } from './constants';

import type * as Types from './type';

export const getServerClient: Types.Get_Server_Client = async (proxyResponse) => {
   const localCookies = await cookies();

   return createServerClient<Database>(SUPABASE.URL, SUPABASE.ANON_KEY, {
      cookies: {
         getAll() {
            return localCookies.getAll();
         },
         setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
               localCookies.set(name, value, options);

               if (proxyResponse) {
                  proxyResponse.cookies.set(name, value, options);
               }
            });
         },
      },
   });
};
