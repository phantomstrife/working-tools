'use client';

import { supabase } from '@admin-web/adapters/supabase/browser';
import { trycatchAsync } from '@admin-web/utilities/trycatch';

import { ATTENDANT_COLUMNS, SEARCH_LIMIT } from './constants';

import type * as Types from './type';

export const useServicesGameLuckyDrawGuardAttendantSearch: Types.Service = async (request) => {
   const { gameId, keyword } = request;

   const result = await trycatchAsync(async () => {
      const term = keyword.trim().toLowerCase();

      if (!term) {
         return [];
      }

      const query = await supabase
         .from('lucky_draw_attendants')
         .select(ATTENDANT_COLUMNS)
         .eq('game_id', gameId)
         .ilike('search_text', `%${term}%`)
         .order('full_name', { ascending: true })
         .limit(SEARCH_LIMIT)
         .returns<Types.Attendant[]>();

      if (query.error) {
         throw new Error(query.error.message);
      }

      return query.data ?? [];
   });

   return result;
};

