import { supabaseBrowser } from '@admin-web/adapters/supabase/client';

import type * as Types from './type';

export const login: Types.Login = async (request) => {
   const auth = await supabaseBrowser.auth.signInWithPassword({
      email: request.email,
      password: request.password,
   });

   if (auth.error || !auth.data.user) {
      throw new Error(auth.error?.message || 'Login failed.');
   }

   const account = await supabaseBrowser
      .from('accounts')
      .select('id, role, is_active, company_id')
      .eq('id', auth.data.user.id)
      .single();

   if (account.error || !account.data) {
      await supabaseBrowser.auth.signOut();
      throw new Error('Account profile not found.');
   }

   if (!account.data.is_active) {
      await supabaseBrowser.auth.signOut();
      throw new Error('Your account has been deactivated.');
   }

   if (account.data.role !== 'SUPER_ADMIN' && account.data.role !== 'ADMIN') {
      await supabaseBrowser.auth.signOut();
      throw new Error('Access Denied: This portal is restricted to Administrators.');
   }

   return {
      user: auth.data.user,
      accountRole: account.data.role,
      companyId: account.data.company_id,
   };
};
