'use server';

import { getServerClient } from '@/adapters/supabase/server';

import type * as Types from './type';

export const getAll: Types.GetAll = async (request = {}) => {
   const supabase = await getServerClient();

   const page = Math.max(1, request.page ?? 1);
   const limit = Math.max(1, request.limit ?? 20);
   const sortOrder = request.sortOrder ?? 'desc';
   const from = (page - 1) * limit;
   const to = from + limit - 1;

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

   const trimmedSearch = request.search?.trim();
   let matchingAttendantIds: string[] | null = null;

   if (trimmedSearch) {
      const attendantsLookup = await supabase
         .from('lucky_draw_attendants')
         .select('id')
         .or(
            `full_name.ilike.%${trimmedSearch}%,ticket_code.ilike.%${trimmedSearch}%,email.ilike.%${trimmedSearch}%,phone.ilike.%${trimmedSearch}%,company_name.ilike.%${trimmedSearch}%`,
         );

      matchingAttendantIds = (attendantsLookup.data ?? []).map((row) => row.id);
      if (matchingAttendantIds.length === 0) {
         return {
            items: [],
            total: 0,
            page,
            limit,
         };
      }
   }

   let query = supabase
      .from('lucky_draw_winners')
      .select(
         '*, lucky_draw_prizes!inner(id, name, tier_order), lucky_draw_attendants!inner(id, full_name, ticket_code, email, phone, company_name, department), games!inner(id, name, event_id, is_dev_only, events!inner(id, name, company_id)), accounts(id, full_name, email)',
         { count: 'exact' },
      );

   if (callerRole === 'ADMIN') {
      if (!callerCompanyId) {
         throw new Error('Admin account is not linked to a company.');
      }
      query = query.eq('games.events.company_id', callerCompanyId).eq('games.is_dev_only', false);
   }

   if (request.gameId && request.gameId !== 'ALL') {
      query = query.eq('game_id', request.gameId);
   }

   if (request.prizeId && request.prizeId !== 'ALL') {
      query = query.eq('prize_id', request.prizeId);
   }

   if (matchingAttendantIds !== null) {
      query = query.in('attendant_id', matchingAttendantIds);
   }

   const result = await query.order('won_at', { ascending: sortOrder === 'asc' }).range(from, to);

   if (result.error) {
      throw new Error(result.error.message);
   }

   return {
      items: result.data ?? [],
      total: result.count ?? 0,
      page,
      limit,
   };
};

