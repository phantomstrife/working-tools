'use server';

import { revalidatePath } from 'next/cache';

import { ROUTE } from '@/constants';
import { getServerClient } from '@/adapters/supabase/server';

import type * as Types from './type';

export const update: Types.Update = async (request) => {
   const supabase = await getServerClient();
   const authResult = await supabase.auth.getUser();

   if (!authResult.data.user) {
      throw new Error('You must be signed in to update events.');
   }

   const callerProfile = await supabase
      .from('accounts')
      .select('role, company_id')
      .eq('id', authResult.data.user.id)
      .single();

   let payload: Omit<Types.EventUpdate, 'id'> = { ...request.event };
   let query = supabase.from('events').update(payload).eq('id', request.id);

   if (callerProfile.data?.role === 'ADMIN') {
      if (!callerProfile.data.company_id) {
         throw new Error('Admin account is not linked to a company.');
      }
      payload = {
         ...payload,
         company_id: callerProfile.data.company_id,
      };
      query = supabase
         .from('events')
         .update(payload)
         .eq('id', request.id)
         .eq('company_id', callerProfile.data.company_id);
   }

   const result = await query;

   if (result.error) {
      throw new Error(result.error.message);
   }

   revalidatePath(ROUTE.ADMIN.EVENT.UPDATE(request.id));
   revalidatePath(ROUTE.ADMIN.EVENT.SEARCH);
};

