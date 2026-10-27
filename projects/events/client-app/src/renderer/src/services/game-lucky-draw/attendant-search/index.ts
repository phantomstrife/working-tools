import { supabase } from '@client-app/adapters/supabase';
import { trycatchAsync } from '@client-app/utilities/trycatch';

import { ATTENDANT_COLUMNS, SEARCH_LIMIT } from './constants';

import type * as Types from './type';

// Manual lookup by name / phone / email / ticket via the trigram-indexed `search_text` column (RLS: assigned staff SELECT).
export const useServicesGameLuckyDrawAttendantSearch: Types.Service = async (request) => {
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
