'use client';

import { supabase } from '@admin-web/adapters/supabase/browser';
import { trycatchAsync } from '@admin-web/utilities/trycatch';

import type * as Types from './type';

export const useServicesGameLuckyDrawCheckInStats: Types.Service = async (request) => {
   const { gameId } = request;

   const result = await trycatchAsync(async () => {
      const [total, checkedIn] = await Promise.all([
         supabase.from('lucky_draw_attendants').select('id', { count: 'exact', head: true }).eq('game_id', gameId),
         supabase
            .from('lucky_draw_attendants')
            .select('id', { count: 'exact', head: true })
            .eq('game_id', gameId)
            .eq('is_checked_in', true),
      ]);

      if (total.error || checkedIn.error) {
         throw new Error((total.error ?? checkedIn.error)?.message);
      }

      return {
         total: total.count ?? 0,
         checkedIn: checkedIn.count ?? 0,
      };
   });

   return result;
};

