'use server';

import { getServerClient } from '@/adapters/supabase/server';

import type * as Types from './type';

export const getById: Types.GetById = async (request) => {
   const supabase = await getServerClient();

   const authResult = await supabase.auth.getUser();
   let callerRole: Types.AccountRole | null = null;
   let callerCompanyId: string | null = null;

   if (authResult.data.user) {
      const callerProfile = await supabase
         .from('accounts')
         .select('role, company_id')
         .eq('id', authResult.data.user.id)
         .single();

      if (callerProfile.data) {
         callerRole = callerProfile.data.role;
         callerCompanyId = callerProfile.data.company_id;
      }
   }

   let query = supabase
      .from('lucky_draw_attendants')
      .select('*, games!inner(id, is_dev_only, events!inner(company_id))')
      .eq('id', request.id);

   if (callerRole === 'ADMIN') {
      if (!callerCompanyId) {
         throw new Error('Admin account is not linked to a company.');
      }
      query = query.eq('games.events.company_id', callerCompanyId).eq('games.is_dev_only', false);
   }

   const result = await query.single();

   if (result.error) {
      throw new Error(result.error.message);
   }

   const { games: _games, ...attendant } = result.data;
   void _games;

   return attendant;
};

