import { supabase } from '@client-app/adapters/supabase';
import { trycatchAsync } from '@client-app/utilities/trycatch';

import { GAME_COLUMNS } from './constants';

import type * as Types from './type';

const groupByEvent = (rows: Types.Game_Row[], includeDevOnly: boolean): Types.Response => {
   const events = new Map<string, Types.Assigned_Event>();

   rows.forEach((row) => {
      const event = Array.isArray(row.event) ? row.event[0] : row.event;

      if (!event || (row.is_dev_only && !includeDevOnly)) {
         return;
      }

      const current = events.get(event.id) ?? { ...event, games: [] };

      if (!current.games.some((game) => game.id === row.id)) {
         current.games.push({ id: row.id, name: row.name, status: row.status });
      }

      events.set(event.id, current);
   });

   return [...events.values()]
      .map((event) => ({ ...event, games: event.games.sort((a, b) => a.name.localeCompare(b.name)) }))
      .sort((a, b) => b.start_time.localeCompare(a.start_time));
};

// Lists the events/games the caller may operate. Staff are scoped by `game_accounts`; SUPER_ADMIN sees every game.
export const useServicesGameAssignmentSearch: Types.Service = async (request) => {
   const { accountId, role, gameType } = request;

   const result = await trycatchAsync(async () => {
      const isSuperAdmin = role === 'SUPER_ADMIN';

      if (isSuperAdmin) {
         const games = await supabase.from('games').select(GAME_COLUMNS).eq('game_type', gameType);

         if (games.error) {
            throw new Error(games.error.message);
         }

         return groupByEvent(games.data as unknown as Types.Game_Row[], true);
      }

      const assignments = await supabase
         .from('game_accounts')
         .select(`game:games!game_accounts_game_id_fkey (${GAME_COLUMNS})`)
         .eq('account_id', accountId);

      if (assignments.error) {
         throw new Error(assignments.error.message);
      }

      const rows = (assignments.data as unknown as { game: Types.Game_Row | Types.Game_Row[] | null }[])
         .flatMap((assignment) => (Array.isArray(assignment.game) ? assignment.game : [assignment.game]))
         .filter((game): game is Types.Game_Row => !!game && game.game_type === gameType);

      return groupByEvent(rows, false);
   });

   return result;
};
