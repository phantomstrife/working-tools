'use server';

import { getServerClient } from '@/adapters/supabase/server';

import type * as Types from './type';

export const getContext: Types.GetContext = async () => {
   const supabase = await getServerClient();
   const authResult = await supabase.auth.getUser();

   let caller: Types.CallerAccount | null = null;

   if (authResult.data.user) {
      const profileResult = await supabase
         .from('accounts')
         .select('id, role, company_id, full_name, email')
         .eq('id', authResult.data.user.id)
         .single();

      if (profileResult.data) {
         caller = profileResult.data;
      }
   }

   let gamesQuery = supabase
      .from('games')
      .select('id, name, event_id, events!inner(id, name, company_id)')
      .eq('game_type', 'LUCKY_DRAW')
      .order('name', { ascending: true });

   if (caller?.role === 'ADMIN') {
      if (!caller.company_id) {
         return { caller, games: [], prizes: [] };
      }
      gamesQuery = gamesQuery.eq('events.company_id', caller.company_id).eq('is_dev_only', false);
   }

   const gamesResult = await gamesQuery;
   const games = gamesResult.data ?? [];
   const gameIds = games.map((game) => game.id);

   let prizes: Types.PrizeOption[] = [];
   if (gameIds.length > 0) {
      const prizesResult = await supabase
         .from('lucky_draw_prizes')
         .select('id, game_id, name, tier_order')
         .in('game_id', gameIds)
         .order('tier_order', { ascending: true });

      prizes = prizesResult.data ?? [];
   }

   return {
      caller,
      games,
      prizes,
   };
};

