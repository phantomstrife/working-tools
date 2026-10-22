'use server';

import { getServerClient } from '@/adapters/supabase/server';

import type * as Types from './type';

export const getAll: Types.GetAll = async (request = {}) => {
   const supabase = await getServerClient();

   const page = Math.max(1, request.page ?? 1);
   const limit = Math.max(1, request.limit ?? 20);
   const sortBy = request.sortBy ?? 'tier_order';
   const sortOrder = request.sortOrder ?? 'asc';
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
      .from('lucky_draw_prizes')
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

   if (request.stockStatus === 'IN_STOCK') {
      query = query.gt('remaining_quantity', 0);
   } else if (request.stockStatus === 'DEPLETED') {
      query = query.eq('remaining_quantity', 0);
   }

   const trimmedSearch = request.search?.trim();
   if (trimmedSearch) {
      query = query.or(`name.ilike.%${trimmedSearch}%,description.ilike.%${trimmedSearch}%`);
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

