'use server';

import { revalidatePath } from 'next/cache';

import { ROUTE } from '@/constants';
import { getServerClient } from '@/adapters/supabase/server';

import type * as Types from './type';

export const deleteById: Types.DeleteById = async (request) => {
   const supabase = await getServerClient();
   const authResult = await supabase.auth.getUser();

   if (!authResult.data.user) {
      throw new Error('You must be signed in to delete events.');
   }

   const callerProfile = await supabase
      .from('accounts')
      .select('role, company_id')
      .eq('id', authResult.data.user.id)
      .single();

   let query = supabase.from('events').delete().eq('id', request.id);

   if (callerProfile.data?.role === 'ADMIN') {
      if (!callerProfile.data.company_id) {
         throw new Error('Admin account is not linked to a company.');
      }
      query = query.eq('company_id', callerProfile.data.company_id);
   }

   const result = await query;

   if (result.error) {
      throw new Error(result.error.message);
   }

   revalidatePath(ROUTE.ADMIN.EVENT.SEARCH);
};

