'use server';

import { getAdminClient } from '@admin-web/adapters/supabase/admin';
import { verifyGameAccess } from '@admin-web/services/game-lucky-draw/verify-game-access';
import { trycatchAsync } from '@admin-web/utilities/trycatch';

import type * as Types from './type';

interface LogRow {
   id: string;
   account_id: string | null;
   action_type: Types.AttendantHistoryActionType;
   metadata: unknown;
   created_at: string | null;
   account:
      | {
           id: string;
           full_name: string | null;
           email: string;
        }
      | {
           id: string;
           full_name: string | null;
           email: string;
        }[]
      | null;
}

const HISTORY_ACTION_TYPES: Types.AttendantHistoryActionType[] = [
   'ATTENDANT_GUARD_EDIT',
   'ATTENDANT_SELF_SERVICE_CONFIRM',
   'ATTENDANT_SELF_SERVICE_UPDATE',
];

const parseChanges = (metadata: unknown): { source: string | null; changes: Types.FieldChange[] } => {
   if (typeof metadata !== 'object' || metadata === null || Array.isArray(metadata)) {
      return { source: null, changes: [] };
   }

   const record = metadata as Record<string, unknown>;
   const source = typeof record.source === 'string' ? record.source : null;
   const rawChanges = record.changes;

   if (typeof rawChanges !== 'object' || rawChanges === null || Array.isArray(rawChanges)) {
      return { source, changes: [] };
   }

   const changes: Types.FieldChange[] = Object.entries(rawChanges as Record<string, unknown>).flatMap(
      ([field, diff]) => {
         if (typeof diff !== 'object' || diff === null || Array.isArray(diff)) {
            return [];
         }

         const diffRecord = diff as Record<string, unknown>;
         const from = typeof diffRecord.from === 'string' ? diffRecord.from : null;
         const to = typeof diffRecord.to === 'string' ? diffRecord.to : null;

         return [{ field, from, to }];
      },
   );

   return { source, changes };
};

export const useServicesGameLuckyDrawAttendantHistorySearch: Types.Service = async (request) => {
   return trycatchAsync(async () => {
      if (!request.gameId || !request.attendantId) {
         throw new Error('services.game_lucky_draw.attendant.not_found');
      }

      const access = await verifyGameAccess({ gameId: request.gameId });

      if (access.error) {
         throw new Error(access.message);
      }

      const adminClient = getAdminClient();
      const query = await adminClient
         .from('logs')
         .select(
            `
            id,
            account_id,
            action_type,
            metadata,
            created_at,
            account:accounts!logs_account_id_fkey (
               id,
               full_name,
               email
            )
         `,
         )
         .eq('game_id', request.gameId)
         .eq('target_entity', 'lucky_draw_attendants')
         .eq('target_id', request.attendantId)
         .in('action_type', HISTORY_ACTION_TYPES)
         .order('created_at', { ascending: false })
         .returns<LogRow[]>();

      if (query.error) {
         throw new Error(query.error.message);
      }

      const entries: Types.AttendantHistoryEntry[] = (query.data ?? []).map((row) => {
         const actor = Array.isArray(row.account) ? row.account[0] : row.account;
         const { source, changes } = parseChanges(row.metadata);

         return {
            id: row.id,
            actionType: row.action_type,
            source,
            actorName: actor?.full_name ?? null,
            actorEmail: actor?.email ?? null,
            createdAt: row.created_at,
            changes,
         };
      });

      return { entries };
   });
};
