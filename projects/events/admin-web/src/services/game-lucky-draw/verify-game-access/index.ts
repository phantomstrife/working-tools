import { getServerClient } from '@admin-web/adapters/supabase/server';
import { trycatchAsync } from '@admin-web/utilities/trycatch';

import type * as Types from './type';

export const verifyGameAccess: Types.Service = async (request) => {
   const { gameId } = request;

   return trycatchAsync(async () => {
      const supabase = await getServerClient();
      const auth = await supabase.auth.getUser();
      const user = auth.data.user;

      if (!user) {
         throw new Error('services.user.unauthenticated');
      }

      const role = user.app_metadata.role as AdminWeb.Database.Account_Role;
      const userCompanyId = user.app_metadata.company_id as string | undefined;

      if (role !== 'SUPER_ADMIN' && role !== 'ADMIN') {
         throw new Error('services.user.access_denied');
      }

      const gameQuery = await supabase
         .from('games')
         .select(
            `
            id,
            name,
            event_id,
            event:events!games_event_id_fkey (
               id,
               name,
               company_id,
               location_name,
               start_time
            )
         `,
         )
         .eq('id', gameId)
         .single();

      if (gameQuery.error || !gameQuery.data || !gameQuery.data.event) {
         throw new Error('services.game_lucky_draw.game_not_found');
      }

      const event = Array.isArray(gameQuery.data.event) ? gameQuery.data.event[0] : gameQuery.data.event;

      if (!event) {
         throw new Error('services.game_lucky_draw.game_not_found');
      }

      if (role === 'ADMIN' && event.company_id !== userCompanyId) {
         throw new Error('services.user.access_denied');
      }

      return {
         supabase,
         userId: user.id,
         role,
         companyId: event.company_id,
         game: {
            id: gameQuery.data.id,
            name: gameQuery.data.name,
            event_id: gameQuery.data.event_id,
         },
         event,
      };
   });
};

