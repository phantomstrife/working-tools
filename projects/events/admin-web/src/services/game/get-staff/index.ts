'use server';

import { getServerClient } from '@admin-web/adapters/supabase/server';
import { trycatchAsync } from '@admin-web/utilities/trycatch';

import type * as Types from './type';

export const useServicesGameGetStaff: Types.Service = async (request) => {
   const { id } = request;

   const result = await trycatchAsync(async () => {
      const supabase = await getServerClient();
      const accounts = await supabase.from('game_accounts').select('*').eq('game_id', id);

      if (!accounts.data) {
         throw new Error('services.game.get_staff_not_found');
      }

      return {
         accounts: accounts.data,
      };
   });

   return result;
};
