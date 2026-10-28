'use client';

import { supabase } from '@admin-web/adapters/supabase/browser';
import { trycatchAsync } from '@admin-web/utilities/trycatch';

import { GAME_COLUMNS } from './constants';

import type * as Types from './type';

const groupByEvent = (rows: Types.Game_Row[], includeDevOnly: boolean): Types.Response => {
   const events = new Map<string, Types.Assigned_Event>();

   rows.forEach((row) => {
      const event = Array.isArray(row.event) ? row.event[0] : row.event;

      if (!event || (row.is_dev_only && !includeDevOnly)) {
         return;
      }

      const current = events.get(event.id) ?? {
         id: event.id,
         name: event.name,
         location_name: event.location_name,
         start_time: event.start_time,
         games: [],
      };

      if (!current.games.some((game) => game.id === row.id)) {
         current.games.push({
            id: row.id,
            name: row.name,
            status: row.status,
            game_type: row.game_type,
            config: row.config,
         });
      }

      events.set(event.id, current);
   });

   return [...events.values()]
      .map((event) => ({ ...event, games: event.games.sort((a, b) => a.name.localeCompare(b.name)) }))
      .sort((a, b) => b.start_time.localeCompare(a.start_time));
};

export const useServicesGameAssignmentSearch: Types.Service = async (request) => {
   const { accountId, role, companyId, gameType } = request;

   const result = await trycatchAsync(async () => {
      if (role === 'SUPER_ADMIN') {
         let query = supabase.from('games').select(GAME_COLUMNS);

         if (gameType) {
            query = query.eq('game_type', gameType);
         }

         const games = await query;

         if (games.error) {
            throw new Error(games.error.message);
         }

         return groupByEvent(games.data as unknown as Types.Game_Row[], true);
      }

      if (role === 'ADMIN') {
         if (!companyId) {
            return [];
         }

         let query = supabase.from('games').select(GAME_COLUMNS);

         if (gameType) {
            query = query.eq('game_type', gameType);
         }

         const games = await query;

         if (games.error) {
            throw new Error(games.error.message);
         }

         const rows = (games.data as unknown as Types.Game_Row[]).filter((row) => {
            const event = Array.isArray(row.event) ? row.event[0] : row.event;

            return Boolean(event && event.company_id === companyId);
         });

         return groupByEvent(rows, false);
      }

      const assignments = await supabase
         .from('game_accounts')
         .select(`event_id, game:games!game_accounts_game_id_fkey (${GAME_COLUMNS})`)
         .eq('account_id', accountId);

      if (assignments.error) {
         throw new Error(assignments.error.message);
      }

      const rows = (assignments.data as unknown as Types.Assignment_Row[]).flatMap((assignment) => {
         const games = Array.isArray(assignment.game) ? assignment.game : [assignment.game];

         return games.filter((game): game is Types.Game_Row => {
            if (!game || (gameType && game.game_type !== gameType)) {
               return false;
            }

            const event = Array.isArray(game.event) ? game.event[0] : game.event;

            if (!event || event.id !== assignment.event_id) {
               return false;
            }

            return !companyId || event.company_id === companyId;
         });
      });

      return groupByEvent(rows, false);
   });

   return result;
};
