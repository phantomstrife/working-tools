'use client';

import { supabase } from '@admin-web/adapters/supabase/browser';
import { trycatchAsync } from '@admin-web/utilities/trycatch';

import { ACCOUNT_COLUMNS, ALLOWED_ROLES } from './constants';

import type * as Types from './type';

export const useServicesAccountRead: Types.Service = async () => {
   const result = await trycatchAsync(async () => {
      const auth = await supabase.auth.getUser();
      const user = auth.data.user;

      if (auth.error || !user) {
         throw new Error('services.user.unauthenticated');
      }

      const account = await supabase.from('accounts').select(ACCOUNT_COLUMNS).eq('id', user.id).single();

      if (account.error || !account.data) {
         throw new Error('services.account.not_found');
      }

      if (!account.data.is_active) {
         throw new Error('services.account.deactivated');
      }

      if (!ALLOWED_ROLES.includes(account.data.role)) {
         throw new Error('services.account.access_denied');
      }

      return {
         id: account.data.id,
         email: account.data.email,
         full_name: account.data.full_name,
         role: account.data.role,
         company_id: account.data.company_id,
      };
   });

   return result;
};

