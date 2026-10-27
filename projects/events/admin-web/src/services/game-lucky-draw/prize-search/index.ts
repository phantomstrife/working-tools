'use client';

import { supabase } from '@admin-web/adapters/supabase/browser';
import { trycatchAsync } from '@admin-web/utilities/trycatch';

import type * as Types from './type';

export const useServicesGameLuckyDrawPrizeSearch: Types.Service = async (request) => {
   const { gameId, page = 1, pageSize = 10, search = '', filter = '' } = request;

   return trycatchAsync(async () => {
      const trimmedSearch = search.trim();
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase.from('lucky_draw_prizes').select('*', { count: 'exact' }).eq('game_id', gameId);

      if (trimmedSearch) {
         query = query.or(`name.ilike.%${trimmedSearch}%,description.ilike.%${trimmedSearch}%`);
      }

      if (filter === 'IN_STOCK') {
         query = query.gt('remaining_quantity', 0);
      } else if (filter === 'DEPLETED') {
         query = query.eq('remaining_quantity', 0);
      }

      const prizes = await query.order('tier_order', { ascending: true }).range(from, to);

      if (prizes.error) {
         throw new Error(prizes.error.message);
      }

      return {
         prizes: prizes.data,
         totalCount: prizes.count ?? 0,
      };
   });
};

