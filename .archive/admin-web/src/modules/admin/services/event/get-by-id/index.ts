'use server';

import { getServerClient } from '@/adapters/supabase/server';

import type * as Types from './type';

export const getById: Types.GetById = async (request) => {
   const supabase = await getServerClient();
   const authResult = await supabase.auth.getUser();

   let query = supabase.from('events').select('*').eq('id', request.id);

   if (authResult.data.user) {
      const callerProfile = await supabase
         .from('accounts')
         .select('role, company_id')
         .eq('id', authResult.data.user.id)
         .single();

      if (callerProfile.data?.role === 'ADMIN') {
         if (!callerProfile.data.company_id) {
            throw new Error('Admin account is not linked to a company.');
         }
         query = query.eq('company_id', callerProfile.data.company_id);
      }
   }

   const result = await query.single();

   if (result.error || !result.data) {
      throw new Error(result.error?.message ?? 'Event not found.');
   }

   return {
      event: result.data,
   };
};

