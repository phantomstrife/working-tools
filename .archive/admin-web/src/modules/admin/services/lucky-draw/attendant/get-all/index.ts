'use server';

import { getServerClient } from '@/adapters/supabase/server';

import type * as Types from './type';

export const getAll: Types.GetAll = async (request = {}) => {
   const supabase = await getServerClient();

   const page = Math.max(1, request.page ?? 1);
   const limit = Math.max(1, request.limit ?? 20);
   const sortBy = request.sortBy ?? 'created_at';
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

   let query = supabase
      .from('lucky_draw_attendants')
      .select('*, games!inner(id, name, event_id, is_dev_only, events!inner(id, name, company_id))', {
         count: 'exact',
      });

   if (callerRole === 'ADMIN') {
      if (!callerCompanyId) {
         throw new Error('Admin account is not linked to a company.');
      }
      query = query.eq('games.events.company_id', callerCompanyId).eq('games.is_dev_only', false);
   }

   if (request.gameId && request.gameId !== 'ALL') {
      query = query.eq('game_id', request.gameId);
   }

   if (request.emailStatus && request.emailStatus !== 'ALL') {
      query = query.eq('email_status', request.emailStatus);
   }

   if (request.checkInFilter === 'CHECKED_IN') {
      query = query.eq('is_checked_in', true);
   } else if (request.checkInFilter === 'NOT_CHECKED_IN') {
      query = query.eq('is_checked_in', false);
   }

   if (request.winnerFilter === 'WINNER') {
      query = query.eq('has_won', true);
   } else if (request.winnerFilter === 'NOT_WINNER') {
      query = query.eq('has_won', false);
   }

   const trimmedSearch = request.search?.trim();
   if (trimmedSearch) {
      query = query.or(
         `full_name.ilike.%${trimmedSearch}%,email.ilike.%${trimmedSearch}%,phone.ilike.%${trimmedSearch}%,ticket_code.ilike.%${trimmedSearch}%,company_name.ilike.%${trimmedSearch}%,department.ilike.%${trimmedSearch}%`,
      );
   }

   const result = await query.order(sortBy, { ascending: sortOrder === 'asc' }).range(from, to);

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

