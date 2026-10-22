'use server';

import { revalidatePath } from 'next/cache';

import { ROUTE } from '@/constants';
import { getServerClient } from '@/adapters/supabase/server';

import type * as Types from './type';

export const deleteById: Types.DeleteById = async (request) => {
   const supabase = await getServerClient();
   const authResult = await supabase.auth.getUser();

   if (!authResult.data.user) {
      throw new Error('You must be signed in to delete companies.');
   }

   const callerProfile = await supabase
      .from('accounts')
      .select('role')
      .eq('id', authResult.data.user.id)
      .single();

   if (callerProfile.data?.role !== 'SUPER_ADMIN') {
      throw new Error('Access Denied: Only SUPER_ADMIN can delete companies.');
   }

   const result = await supabase.from('companies').delete().eq('id', request.id);

   if (result.error) {
      throw new Error(result.error.message);
   }

   revalidatePath(ROUTE.ADMIN.COMPANY.SEARCH);
};
