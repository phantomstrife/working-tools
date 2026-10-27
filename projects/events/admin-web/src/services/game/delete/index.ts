'use server';

import { verifyGameAccess } from '@admin-web/services/game-lucky-draw/verify-game-access';
import { trycatchAsync } from '@admin-web/utilities/trycatch';

import type * as Types from './type';

export const useServicesGameDelete: Types.Service = async (request) => {
   return trycatchAsync(async () => {
      const access = await verifyGameAccess({ gameId: request.id });

      if (access.error) {
         throw new Error(access.message);
      }

      const { supabase } = access.data;

      const deleted = await supabase.from('games').delete().eq('id', request.id);

      if (deleted.error) {
         throw new Error(deleted.error.message || 'services.game.delete_failed');
      }

      return {
         deletedId: request.id,
      };
   });
};

