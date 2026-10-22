'use server';

import { getServerClient } from '@/adapters/supabase/server';

import type * as Types from './type';

export const getById: Types.GetById = async (request) => {
   const supabase = await getServerClient();
   const authResult = await supabase.auth.getUser();

   if (!authResult.data.user) {
      throw new Error('You must be signed in to view company details.');
   }

   const callerProfile = await supabase
      .from('accounts')
      .select('role')
      .eq('id', authResult.data.user.id)
      .single();

   if (callerProfile.data?.role !== 'SUPER_ADMIN') {
      throw new Error('Access Denied: Only SUPER_ADMIN can view company details.');
   }

   const result = await supabase.from('companies').select('*').eq('id', request.id).single();

   if (result.error || !result.data) {
      throw new Error(result.error?.message ?? 'Company not found.');
   }

   return {
      company: result.data,
   };
};
