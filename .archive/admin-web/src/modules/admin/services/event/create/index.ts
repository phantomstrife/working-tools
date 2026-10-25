'use server';

import { revalidatePath } from 'next/cache';

import { ROUTE } from '@/constants';
import { getServerClient } from '@/adapters/supabase/server';

import type * as Types from './type';

export const create: Types.Create = async (request) => {
   const supabase = await getServerClient();
   const authResult = await supabase.auth.getUser();

   if (!authResult.data.user) {
      throw new Error('You must be signed in to create events.');
   }

   const callerProfile = await supabase
      .from('accounts')
      .select('role, company_id')
      .eq('id', authResult.data.user.id)
      .single();

   if (!callerProfile.data) {
      throw new Error('Caller account profile not found.');
   }

   let payload: Types.EventInsert = { ...request.event };

   if (callerProfile.data.role === 'ADMIN') {
      if (!callerProfile.data.company_id) {
         throw new Error('Admin account is not linked to a company.');
      }
      payload = {
         ...payload,
         company_id: callerProfile.data.company_id,
      };
   }

   if (!payload.company_id) {
      throw new Error('Company is required to create an event.');
   }

   const result = await supabase.from('events').insert(payload).select('*').single();

   if (result.error || !result.data) {
      throw new Error(result.error?.message ?? 'Failed to create event.');
   }

   revalidatePath(ROUTE.ADMIN.EVENT.SEARCH);

   return {
      event: result.data,
   };
};

