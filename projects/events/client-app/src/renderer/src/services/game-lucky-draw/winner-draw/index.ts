import { requestAdminApi } from '@client-app/adapters/admin-api';
import { ADMIN_API } from '@client-app/adapters/admin-api/constants';
import { trycatchAsync } from '@client-app/utilities/trycatch';

import type * as Types from './type';

export const useServicesGameLuckyDrawWinnerDraw: Types.Service = async (request) => {
   const result = await trycatchAsync(async () => {
      return requestAdminApi<Types.Response>({
         path: ADMIN_API.PATH.GAME_LUCKY_DRAW_DRAW,
         body: { ...request },
      });
   });

   return result;
};
