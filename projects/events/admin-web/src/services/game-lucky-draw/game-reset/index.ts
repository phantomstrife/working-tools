'use server';

import { getAdminClient } from '@admin-web/adapters/supabase/admin';
import { getServerClient } from '@admin-web/adapters/supabase/server';
import { verifyGameAccess } from '@admin-web/services/game-lucky-draw/verify-game-access';
import { trycatchAsync } from '@admin-web/utilities/trycatch';

import type * as Types from './type';

const FETCH_PAGE_SIZE = 1000;
const METADATA_UPDATE_BATCH_SIZE = 25;

interface AttendantResetRow {
   id: string;
   has_won: boolean | null;
   is_checked_in: boolean | null;
   custom_metadata: AdminWeb.Database.GameLuckyDrawAttendant['custom_metadata'];
}

const getMetadataObject = (
   customMetadata: AdminWeb.Database.GameLuckyDrawAttendant['custom_metadata'],
): Record<string, unknown> | null => {
   if (typeof customMetadata === 'object' && customMetadata !== null && !Array.isArray(customMetadata)) {
      return customMetadata as Record<string, unknown>;
   }

   return null;
};

export const useServicesGameLuckyDrawGameReset: Types.Service = async (request) => {
   return trycatchAsync(async () => {
      const { gameId, mode, resetCheckIns = false, deleteAttendants = false } = request;

      if (!gameId) {
         throw new Error('services.game_lucky_draw.game_not_found');
      }

      const supabase = await getServerClient();
      const auth = await supabase.auth.getUser();
      const user = auth.data.user;

      if (auth.error || !user) {
         throw new Error('services.user.unauthenticated');
      }

      const account = await supabase
         .from('accounts')
         .select('id, role, company_id, is_active')
         .eq('id', user.id)
         .single();

      if (account.error || !account.data) {
         throw new Error('services.account.not_found');
      }

      if (!account.data.is_active) {
         throw new Error('services.account.deactivated');
      }

      const callerRole = account.data.role;

      if (callerRole !== 'SUPER_ADMIN' && callerRole !== 'ADMIN') {
         throw new Error('services.game_lucky_draw.game_reset.forbidden');
      }

      const isAdmin = callerRole === 'ADMIN';

      if (isAdmin && (request.resetCheckIns === true || request.deleteAttendants === true)) {
         throw new Error('services.game_lucky_draw.game_reset.admin_option_forbidden');
      }

      const access = await verifyGameAccess({ gameId });

      if (access.error) {
         throw new Error(access.message);
      }

      if (isAdmin && (!account.data.company_id || access.data.event.company_id !== account.data.company_id)) {
         throw new Error('services.user.access_denied');
      }

      const isGameDataOnly = isAdmin || mode === 'GAME_DATA_ONLY';
      const effectiveDeleteAttendants = !isGameDataOnly && Boolean(deleteAttendants);
      const effectiveResetCheckIns = !isGameDataOnly && !effectiveDeleteAttendants && Boolean(resetCheckIns);

      const admin = getAdminClient();

      const nowIso = new Date().toISOString();

      // 1. Clear all winners for this game.
      const winnersDelete = await admin
         .from('lucky_draw_winners')
         .delete()
         .eq('game_id', gameId)
         .select('id');

      if (winnersDelete.error) {
         throw new Error(winnersDelete.error.message);
      }

      const deletedWinners = winnersDelete.data?.length ?? 0;

      // 2. Restore prize stock (remaining_quantity = total_quantity) for all prizes in this game.
      const prizesQuery = await admin
         .from('lucky_draw_prizes')
         .select('id, total_quantity')
         .eq('game_id', gameId);

      if (prizesQuery.error) {
         throw new Error(prizesQuery.error.message);
      }

      const prizes = prizesQuery.data ?? [];

      await Promise.all(
         prizes.map(async (prize) => {
            const prizeUpdate = await admin
               .from('lucky_draw_prizes')
               .update({
                  remaining_quantity: prize.total_quantity,
                  ...(effectiveDeleteAttendants ? { designated_attendant_ids: [] } : {}),
                  updated_at: nowIso,
               })
               .eq('id', prize.id)
               .eq('game_id', gameId);

            if (prizeUpdate.error) {
               throw new Error(prizeUpdate.error.message);
            }
         }),
      );

      const resetPrizes = prizes.length;
      let resetAttendants = 0;
      let deletedAttendants = 0;

      // 3. Delete or reset attendants for this game.
      if (effectiveDeleteAttendants) {
         const attendantsDelete = await admin
            .from('lucky_draw_attendants')
            .delete()
            .eq('game_id', gameId)
            .select('id');

         if (attendantsDelete.error) {
            throw new Error(attendantsDelete.error.message);
         }

         deletedAttendants = attendantsDelete.data?.length ?? 0;
      } else {
         const affectedIds = new Set<string>();
         const forfeitedRows: Array<{ id: string; cleanedMetadata: Record<string, unknown> }> = [];
         let offset = 0;

         while (true) {
            const page = await admin
               .from('lucky_draw_attendants')
               .select('id, has_won, is_checked_in, custom_metadata')
               .eq('game_id', gameId)
               .range(offset, offset + FETCH_PAGE_SIZE - 1)
               .returns<AttendantResetRow[]>();

            if (page.error) {
               throw new Error(page.error.message);
            }

            const rows = page.data ?? [];

            rows.forEach((row) => {
               const metadata = getMetadataObject(row.custom_metadata);
               const hasForfeitedFlag = Boolean(metadata && 'is_absent_forfeited' in metadata);

               if (row.has_won || (effectiveResetCheckIns && row.is_checked_in) || hasForfeitedFlag) {
                  affectedIds.add(row.id);
               }

               if (metadata && hasForfeitedFlag) {
                  const { is_absent_forfeited: _ignored, ...restMetadata } = metadata;
                  void _ignored;
                  forfeitedRows.push({
                     id: row.id,
                     cleanedMetadata: restMetadata,
                  });
               }
            });

            if (rows.length < FETCH_PAGE_SIZE) {
               break;
            }

            offset += FETCH_PAGE_SIZE;
         }

         if (effectiveResetCheckIns) {
            const bulkUpdate = await admin
               .from('lucky_draw_attendants')
               .update({
                  has_won: false,
                  is_checked_in: false,
                  checked_in_at: null,
                  checked_in_by: null,
                  check_in_method: null,
                  updated_at: nowIso,
               })
               .eq('game_id', gameId);

            if (bulkUpdate.error) {
               throw new Error(bulkUpdate.error.message);
            }
         } else {
            const bulkUpdate = await admin
               .from('lucky_draw_attendants')
               .update({
                  has_won: false,
                  updated_at: nowIso,
               })
               .eq('game_id', gameId)
               .eq('has_won', true);

            if (bulkUpdate.error) {
               throw new Error(bulkUpdate.error.message);
            }
         }

         for (let i = 0; i < forfeitedRows.length; i += METADATA_UPDATE_BATCH_SIZE) {
            const batch = forfeitedRows.slice(i, i + METADATA_UPDATE_BATCH_SIZE);

            await Promise.all(
               batch.map(async (item) => {
                  const metadataUpdate = await admin
                     .from('lucky_draw_attendants')
                     .update({
                        custom_metadata:
                           item.cleanedMetadata as AdminWeb.Database.GameLuckyDrawAttendant['custom_metadata'],
                        updated_at: nowIso,
                     })
                     .eq('id', item.id)
                     .eq('game_id', gameId);

                  if (metadataUpdate.error) {
                     throw new Error(metadataUpdate.error.message);
                  }
               }),
            );
         }

         resetAttendants = affectedIds.size;
      }

      return {
         deletedWinners,
         resetPrizes,
         resetAttendants,
         deletedAttendants,
      };
   });
};
