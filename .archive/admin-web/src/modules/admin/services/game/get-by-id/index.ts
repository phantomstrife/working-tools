'use server';

import { getServerClient } from '@/adapters/supabase/server';

import type * as Types from './type';

export const getById: Types.GetById = async (request) => {
   const supabase = await getServerClient();
   const authResult = await supabase.auth.getUser();

   let query = supabase.from('games').select('*').eq('id', request.id);

   if (authResult.data.user) {
      const callerProfile = await supabase
         .from('accounts')
         .select('role, company_id')
         .eq('id', authResult.data.user.id)
         .single();

      if (callerProfile.data?.role === 'ADMIN') {
         query = query.eq('is_dev_only', false);
      }
   }

   const [gameResult, assignmentsResult] = await Promise.all([
      query.single(),
      supabase.from('game_accounts').select('account_id').eq('game_id', request.id),
   ]);

   if (gameResult.error || !gameResult.data) {
      throw new Error(gameResult.error?.message ?? 'Game not found.');
   }

   const assignedAccountIds = (assignmentsResult.data ?? []).map((row) => row.account_id);

   return {
      game: gameResult.data,
      assignedAccountIds,
   };
};

