'use server';

import { verifyGameAccess } from '@admin-web/services/game-lucky-draw/verify-game-access';
import { trycatchAsync } from '@admin-web/utilities/trycatch';

import type * as Types from './type';

export const useServicesGameLuckyDrawAttendantToggleEligibility: Types.Service = async (request) => {
   return trycatchAsync(async () => {
      const access = await verifyGameAccess({ gameId: request.gameId });

      if (access.error) {
         throw new Error(access.message);
      }

      const { supabase } = access.data;

      const updated = await supabase
         .from('lucky_draw_attendants')
         .update({
            is_draw_eligible: Boolean(request.isDrawEligible),
            updated_at: new Date().toISOString(),
         })
         .eq('id', request.attendantId)
         .eq('game_id', request.gameId)
         .select('*')
         .single();

      if (updated.error || !updated.data) {
         throw new Error(updated.error?.message || 'services.game_lucky_draw.attendant.save_failed');
      }

      return {
         attendant: updated.data,
      };
   });
};
