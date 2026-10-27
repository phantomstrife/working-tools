'use server';

import { verifyGameAccess } from '@admin-web/services/game-lucky-draw/verify-game-access';
import { trycatchAsync } from '@admin-web/utilities/trycatch';

import type * as Types from './type';

export const useServicesGameLuckyDrawPrizeDelete: Types.Service = async (request) => {
   return trycatchAsync(async () => {
      const access = await verifyGameAccess({ gameId: request.gameId });

      if (access.error) {
         throw new Error(access.message);
      }

      const { supabase } = access.data;

      const deleted = await supabase
         .from('lucky_draw_prizes')
         .delete()
         .eq('id', request.id)
         .eq('game_id', request.gameId);

      if (deleted.error) {
         throw new Error(deleted.error.message);
      }

      return {
         deletedId: request.id,
      };
   });
};

