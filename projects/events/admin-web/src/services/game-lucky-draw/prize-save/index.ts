'use server';

import { verifyGameAccess } from '@admin-web/services/game-lucky-draw/verify-game-access';
import { trycatchAsync } from '@admin-web/utilities/trycatch';

import type * as Types from './type';

export const useServicesGameLuckyDrawPrizeSave: Types.Service = async (request) => {
   return trycatchAsync(async () => {
      const access = await verifyGameAccess({ gameId: request.gameId });

      if (access.error) {
         throw new Error(access.message);
      }

      const { supabase } = access.data;
      const trimmedName = request.name.trim();

      if (!trimmedName) {
         throw new Error('services.game_lucky_draw.prize.missing_name');
      }

      if (
         request.total_quantity < 1 ||
         request.remaining_quantity < 0 ||
         request.remaining_quantity > request.total_quantity
      ) {
         throw new Error('services.game_lucky_draw.prize.invalid_quantity');
      }

      const normalizedPayload = {
         name: trimmedName,
         tier_order: Math.max(1, Math.floor(request.tier_order)),
         total_quantity: Math.floor(request.total_quantity),
         remaining_quantity: Math.floor(request.remaining_quantity),
         description: request.description?.trim() || null,
         image_url: request.image_url?.trim() || null,
      };

      if (request.id) {
         const updatePayload: AdminWeb.Database.GameLuckyDrawPrizeUpdate = {
            ...normalizedPayload,
            updated_at: new Date().toISOString(),
         };

         const updated = await supabase
            .from('lucky_draw_prizes')
            .update(updatePayload)
            .eq('id', request.id)
            .eq('game_id', request.gameId)
            .select('*')
            .single();

         if (updated.error || !updated.data) {
            throw new Error(updated.error?.message || 'services.game_lucky_draw.prize.save_failed');
         }

         return {
            prize: updated.data,
         };
      }

      const insertPayload: AdminWeb.Database.GameLuckyDrawPrizeInsert = {
         ...normalizedPayload,
         game_id: request.gameId,
      };

      const created = await supabase.from('lucky_draw_prizes').insert(insertPayload).select('*').single();

      if (created.error || !created.data) {
         throw new Error(created.error?.message || 'services.game_lucky_draw.prize.save_failed');
      }

      return {
         prize: created.data,
      };
   });
};

