'use server';

import { verifyGameAccess } from '@admin-web/services/game-lucky-draw/verify-game-access';
import { trycatchAsync } from '@admin-web/utilities/trycatch';

import type * as Types from './type';

export const useServicesGameStaffUnassign: Types.Service = async (request) => {
   return trycatchAsync(async () => {
      const access = await verifyGameAccess({ gameId: request.gameId });

      if (access.error) {
         throw new Error(access.message);
      }

      const { supabase } = access.data;

      const deleted = await supabase
         .from('game_accounts')
         .delete()
         .eq('id', request.assignmentId)
         .eq('game_id', request.gameId);

      if (deleted.error) {
         throw new Error(deleted.error.message);
      }

      return {
         unassignedId: request.assignmentId,
      };
   });
};

