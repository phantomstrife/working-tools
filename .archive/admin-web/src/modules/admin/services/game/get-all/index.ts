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
      .from('games')
      .select('*, events!inner(id, name, company_id), game_accounts(account_id)', { count: 'exact' });

   if (callerRole === 'ADMIN') {
      if (!callerCompanyId) {
         throw new Error('Admin account is not linked to a company.');
      }
      query = query.eq('events.company_id', callerCompanyId).eq('is_dev_only', false);
   }

   if (request.eventId && request.eventId !== 'ALL') {
      query = query.eq('event_id', request.eventId);
   }

   if (request.gameType && request.gameType !== 'ALL') {
      query = query.eq('game_type', request.gameType);
   }

   const trimmedSearch = request.search?.trim();
   if (trimmedSearch) {
      query = query.or(`name.ilike.%${trimmedSearch}%,description.ilike.%${trimmedSearch}%`);
   }

   if (request.status && request.status !== 'ALL') {
      query = query.eq('status', request.status);
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

