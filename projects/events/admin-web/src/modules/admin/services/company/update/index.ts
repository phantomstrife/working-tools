'use server';

import { revalidatePath } from 'next/cache';

import { ROUTE } from '@/constants';
import { getServerClient } from '@/adapters/supabase/server';

import type * as Types from './type';

export const update: Types.Update = async (request) => {
   const supabase = await getServerClient();
   const authResult = await supabase.auth.getUser();

   if (!authResult.data.user) {
      throw new Error('You must be signed in to update companies.');
   }

   const callerProfile = await supabase
      .from('accounts')
      .select('role')
      .eq('id', authResult.data.user.id)
      .single();

   if (callerProfile.data?.role !== 'SUPER_ADMIN') {
      throw new Error('Access Denied: Only SUPER_ADMIN can update companies.');
   }

   const result = await supabase.from('companies').update(request.company).eq('id', request.id);

   if (result.error) {
      throw new Error(result.error.message);
   }

   revalidatePath(ROUTE.ADMIN.COMPANY.UPDATE(request.id));
   revalidatePath(ROUTE.ADMIN.COMPANY.SEARCH);
};
