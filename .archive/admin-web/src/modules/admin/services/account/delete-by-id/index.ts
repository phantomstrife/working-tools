'use server';

import { revalidatePath } from 'next/cache';

import { ROUTE } from '@/constants';
import { getServerClient } from '@/adapters/supabase/server';
import { getAdminClient } from '@/adapters/supabase/admin';

import type * as Types from './type';

export const deleteById: Types.DeleteById = async (request) => {
   const supabase = await getServerClient();
   const authResult = await supabase.auth.getUser();

   if (!authResult.data.user) {
      throw new Error('You must be signed in to delete accounts.');
   }

   if (authResult.data.user.id === request.id) {
      throw new Error('You cannot delete your own active account.');
   }

   const callerProfile = await supabase
      .from('accounts')
      .select('role, company_id')
      .eq('id', authResult.data.user.id)
      .single();

   if (callerProfile.data?.role !== 'SUPER_ADMIN' && callerProfile.data?.role !== 'ADMIN') {
      throw new Error('Only SUPER_ADMIN or ADMIN accounts can delete accounts.');
   }

   // Verify the target is visible to the caller (RLS scopes ADMIN to their own company).
   const target = await supabase.from('accounts').select('id').eq('id', request.id).single();

   if (target.error || !target.data) {
      throw new Error('Account not found or you do not have permission to delete it.');
   }

   // Remove the Supabase Auth user so the credentials can no longer sign in.
   // A 404 is tolerated for legacy rows that were created without an auth user.
   const admin = getAdminClient();
   const authDelete = await admin.auth.admin.deleteUser(request.id);

   if (authDelete.error && authDelete.error.status !== 404) {
      throw new Error(authDelete.error.message);
   }

   const result = await supabase.from('accounts').delete().eq('id', request.id);

   if (result.error) {
      throw new Error(result.error.message);
   }

   revalidatePath(ROUTE.ADMIN.ACCOUNT.SEARCH);
};
