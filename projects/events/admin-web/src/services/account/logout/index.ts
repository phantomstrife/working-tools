'use client';

import { supabase } from '@admin-web/adapters/supabase/browser';
import { trycatchAsync } from '@admin-web/utilities/trycatch';

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

