import { supabase } from '@/lib/supabase';

export type LoginCredentials = {
   email: string;
   password: string;
};

export const AuthService = {
   async loginWithRoleCheck({ email, password }: LoginCredentials) {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
         email,
         password,
      });

      if (authError || !authData.user) {
         throw new Error(authError?.message || 'Login failed.');
      }

      const { data: account, error: accountError } = await supabase
         .from('accounts')
         .select('id, role, is_active, company_id')
         .eq('id', authData.user.id)
         .single();

      if (accountError || !account) {
         await supabase.auth.signOut();
         throw new Error('Account profile not found.');
      }

      if (!account.is_active) {
         await supabase.auth.signOut();
         throw new Error('Your account has been deactivated.');
      }

      if (account.role !== 'SUPER_ADMIN' && account.role !== 'ADMIN') {
         await supabase.auth.signOut();
         throw new Error('Access Denied: This portal is restricted to Administrators.');
      }

      return {
         user: authData.user,
         role: account.role,
         companyId: account.company_id,
      };
   },
};
