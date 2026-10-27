'use server';

import { getServerClient } from '@admin-web/adapters/supabase/server';
import { trycatchAsync } from '@admin-web/utilities/trycatch';

import type * as Types from './type';

export const useServicesGameLuckyDrawPrizesGet: Types.Service = async (request) => {
   const { id } = request;

   const result = await trycatchAsync(async () => {
      const supabase = await getServerClient();
      const prizes = await supabase.from('lucky_draw_prizes').select('*').eq('game_id', id);

      if (!prizes.data) {
         throw new Error('services.game_lucky_draw.prize.not_found');
      }

      return {
         prizes: prizes.data,
      };
   });

   return result;
};
