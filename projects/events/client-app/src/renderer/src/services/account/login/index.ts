import { supabase } from '@client-app/adapters/supabase';
import { useServicesAccountRead } from '@client-app/services/account/read';
import { trycatchAsync } from '@client-app/utilities/trycatch';

import type * as Types from './type';

export const useServicesAccountLogin: Types.Service = async (request) => {
   const { email, password } = request;

   const result = await trycatchAsync(async () => {
      const auth = await supabase.auth.signInWithPassword({
         email,
         password,
      });

      if (auth.error || !auth.data.user) {
         throw new Error('services.account.login_failed');
      }

      const serviceAccountRead = await useServicesAccountRead();

      if (serviceAccountRead.error) {
         throw new Error(serviceAccountRead.message);
      }

      return serviceAccountRead.data;
   });

   if (result.error) {
      await supabase.auth.signOut();
   }

   return result;
};
