'use client';

import { supabase } from '@admin-web/adapters/supabase/browser';
import { trycatchAsync } from '@admin-web/utilities/trycatch';

import { ATTENDANT_COLUMNS } from './constants';

import type * as Types from './type';

export const useServicesGameLuckyDrawGuardAttendantUpdateRepresentative: Types.Service = async (request) => {
   const { gameId, attendantId, representative } = request;

   const result = await trycatchAsync(async () => {
      const normalizedRepresentative = representative?.trim() || null;

      if (!gameId || !attendantId) {
         throw new Error('services.game_lucky_draw.attendant.not_found');
      }

      const query = await supabase
         .from('lucky_draw_attendants')
         .update({
            representative: normalizedRepresentative,
         })
         .eq('id', attendantId)
         .eq('game_id', gameId)
         .select(ATTENDANT_COLUMNS)
         .maybeSingle<Types.Attendant>();

      if (query.error) {
         throw new Error(query.error.message);
      }

      if (!query.data) {
         throw new Error('services.game_lucky_draw.attendant.not_found');
      }

      return query.data;
   });

   return result;
};
