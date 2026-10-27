import { requestAdminApi } from '@client-app/adapters/admin-api';
import { ADMIN_API } from '@client-app/adapters/admin-api/constants';
import { trycatchAsync } from '@client-app/utilities/trycatch';

import type * as Types from './type';

// Delegates the write to [ADMIN_WEB] `/api/game-lucky-draw/check-in` (assignment check, race-safe update + audit log).
export const useServicesGameLuckyDrawAttendantCheckIn: Types.Service = async (request) => {
   const result = await trycatchAsync(async () => {
      return requestAdminApi<Types.Response>({
         path: ADMIN_API.PATH.GAME_LUCKY_DRAW_CHECK_IN,
         body: { ...request },
      });
   });

   return result;
};
