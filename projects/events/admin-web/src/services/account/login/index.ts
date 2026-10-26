'use client';

import { supabase } from '@admin-web/adapters/supabase/browser';
import { trycatchAsync } from '@admin-web/utilities/trycatch';

import type * as Types from './type';

export const useServiceAccountLogin: Types.Login = async (request) => {
   const result = await trycatchAsync(async () => {
      const auth = await supabase.auth.signInWithPassword({
         email: request.email,
         password: request.password,
      });

      if (auth.error || !auth.data.user) {
         throw new Error(auth.error?.message || 'services.account.login_failed');
      }

      const account = await supabase
         .from('accounts')
         .select('id, role, is_active, company_id')
         .eq('id', auth.data.user.id)
         .single();

      if (account.error || !account.data) {
         throw new Error('services.account.not_found');
      }

      if (!account.data.is_active) {
         throw new Error('services.account.deactivated');
      }

      if (account.data.role !== 'SUPER_ADMIN' && account.data.role !== 'ADMIN') {
         throw new Error('services.account.access_denied');
      }

      return {
         user: auth.data.user,
         accountRole: account.data.role,
         companyId: account.data.company_id,
      };
   });

   if (result.error) {
      await supabase.auth.signOut();
   }

   return result;
};
