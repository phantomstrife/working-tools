'use client';

import { supabase } from '@admin-web/adapters/supabase/browser';
import { trycatchAsync } from '@admin-web/utilities/trycatch';

import type * as Types from './type';

export const useServicesGameLuckyDrawAttendantSearch: Types.Service = async (request) => {
   const result = await trycatchAsync(async () => {
      const { gameId, page = 1, pageSize = 10, search = '', filter = '' } = request;

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase.from('lucky_draw_attendants').select('*', { count: 'exact' }).eq('game_id', gameId);

      const trimmedSearch = search.trim();
      if (trimmedSearch) {
         query = query.or(
            `full_name.ilike.%${trimmedSearch}%,phone.ilike.%${trimmedSearch}%,email.ilike.%${trimmedSearch}%,ticket_code.ilike.%${trimmedSearch}%`,
         );
      }

      if (filter === 'CHECKED_IN') {
         query = query.eq('is_checked_in', true);
      } else if (filter === 'NOT_CHECKED_IN') {
         query = query.eq('is_checked_in', false);
      } else if (filter === 'WINNER') {
         query = query.eq('has_won', true);
      } else if (filter === 'NOT_WINNER') {
         query = query.eq('has_won', false);
      }

      const attendants = await query.order('ticket_code', { ascending: false }).range(from, to);

      if (attendants.error) {
         throw new Error(attendants.error.message);
      }

      return {
         attendants: (attendants.data ?? []) as AdminWeb.Database.GameLuckyDrawAttendant[],
         totalCount: attendants.count ?? 0,
      };
   });

   return result;
};
