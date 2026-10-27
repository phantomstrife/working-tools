import { supabase } from '@client-app/adapters/supabase';
import { trycatchAsync } from '@client-app/utilities/trycatch';

import type * as Types from './type';

export const useServicesAccountLogout: Types.Service = async () => {
   const result = await trycatchAsync(async () => {
      const auth = await supabase.auth.signOut();

      if (auth.error) {
         throw new Error(auth.error.message);
      }

      return null;
   });

   return result;
};
