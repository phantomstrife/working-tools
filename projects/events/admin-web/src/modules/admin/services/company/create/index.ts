'use server';

import { revalidatePath } from 'next/cache';

import { ROUTE } from '@/constants';
import { getServerClient } from '@/adapters/supabase/server';

import type * as Types from './type';

export const create: Types.Create = async (request) => {
   const supabase = await getServerClient();
   const authResult = await supabase.auth.getUser();

   if (!authResult.data.user) {
      throw new Error('You must be signed in to create companies.');
   }

   const callerProfile = await supabase
      .from('accounts')
      .select('role')
      .eq('id', authResult.data.user.id)
      .single();

   if (callerProfile.data?.role !== 'SUPER_ADMIN') {
      throw new Error('Access Denied: Only SUPER_ADMIN can create companies.');
   }

   const result = await supabase.from('companies').insert(request.company).select('*').single();

   if (result.error || !result.data) {
      throw new Error(result.error?.message ?? 'Failed to create company.');
   }

   revalidatePath(ROUTE.ADMIN.COMPANY.SEARCH);

   return {
      company: result.data,
   };
};
