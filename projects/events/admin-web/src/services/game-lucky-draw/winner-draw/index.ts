import { randomInt } from 'crypto';

import { getAdminClient } from '@admin-web/adapters/supabase/admin';
import { getTokenClient } from '@admin-web/adapters/supabase/token';
import { trycatchAsync } from '@admin-web/utilities/trycatch';

import { ALLOWED_ROLES, ATTENDANT_COLUMNS, ELIGIBLE_POOL_PAGE_SIZE, PRIZE_COLUMNS } from './constants';

import type * as Types from './type';

const isAbsentForfeited = (metadata: unknown): boolean => {
   if (typeof metadata !== 'object' || metadata === null || Array.isArray(metadata)) {
      return false;
   }

   return Boolean((metadata as Record<string, unknown>).is_absent_forfeited);
};

const normalizeUuid = (id: string): string => {
   return id.trim().toLowerCase();
};

const normalizeUuidList = (value: unknown): string[] => {
   if (Array.isArray(value)) {
      return value
         .filter((item): item is string => typeof item === 'string')
         .map(normalizeUuid)
         .filter(Boolean);
   }

   if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
         return trimmed
            .slice(1, -1)
            .split(',')
            .map((item) => normalizeUuid(item.replace(/^"|"$/g, '')))
            .filter(Boolean);
      }
   }

   return [];
};

export const useServicesGameLuckyDrawWinnerDraw: Types.Service = async (request) => {
   const { accessToken, gameId, prizeId, revokeWinnerRecordId, excludeAttendantIds = [] } = request;

   const result = await trycatchAsync(async () => {
      if (!accessToken) {
         throw new Error('services.user.unauthenticated');
      }

      if (!gameId || !prizeId) {
         throw new Error('services.game_lucky_draw.draw.missing_fields');
      }

      const userClient = getTokenClient(accessToken);
      const auth = await userClient.auth.getUser(accessToken);
      const user = auth.data.user;

      if (auth.error || !user) {
         throw new Error('services.user.unauthenticated');
      }

      const admin = getAdminClient();
      const account = await admin
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

      const role = account.data.role as Types.Account_Role;

      if (!ALLOWED_ROLES.includes(role)) {
         throw new Error('services.user.access_denied');
      }

      const game = await admin.from('games').select('id, event_id, is_dev_only').eq('id', gameId).maybeSingle();

      if (game.error || !game.data) {
         throw new Error('services.game_lucky_draw.game_not_found');
      }

      if (role !== 'SUPER_ADMIN') {
         if (game.data.is_dev_only) {
            throw new Error('services.game_lucky_draw.game_not_found');
         }

         const event = await admin
            .from('events')
            .select('id, company_id')
            .eq('id', game.data.event_id)
            .maybeSingle();

         if (event.error || !event.data) {
            throw new Error('services.game_lucky_draw.draw.game_not_assigned');
         }

         if (role === 'ADMIN') {
            if (!account.data.company_id || event.data.company_id !== account.data.company_id) {
               throw new Error('services.game_lucky_draw.draw.game_not_assigned');
            }
         } else {
            if (account.data.company_id && event.data.company_id !== account.data.company_id) {
               throw new Error('services.game_lucky_draw.draw.game_not_assigned');
            }

            const assignment = await admin
               .from('game_accounts')
               .select('id')
               .eq('game_id', gameId)
               .eq('event_id', game.data.event_id)
               .eq('account_id', user.id)
               .maybeSingle();

            if (assignment.error || !assignment.data) {
               throw new Error('services.game_lucky_draw.draw.game_not_assigned');
            }
         }
      }

      const prizeQuery = await admin
         .from('lucky_draw_prizes')
         .select(PRIZE_COLUMNS)
         .eq('id', prizeId)
         .eq('game_id', gameId)
         .maybeSingle<Types.Prize>();

      if (prizeQuery.error || !prizeQuery.data) {
         throw new Error('services.game_lucky_draw.prize.not_found');
      }

      let currentPrize = prizeQuery.data;
      let revokedWinnerRecordId: string | null = null;
      let revokedAttendantId: string | null = null;

      // Optional step: revoke an absent winner before drawing the replacement.
      if (revokeWinnerRecordId) {
         const existingWinner = await admin
            .from('lucky_draw_winners')
            .select('id, attendant_id, prize_id')
            .eq('id', revokeWinnerRecordId)
            .eq('game_id', gameId)
            .maybeSingle();

         if (existingWinner.error || !existingWinner.data) {
            throw new Error('services.game_lucky_draw.draw.winner_not_found');
         }

         const absentAttendantId = existingWinner.data.attendant_id;

         const deleteWinner = await admin.from('lucky_draw_winners').delete().eq('id', existingWinner.data.id);

         if (deleteWinner.error) {
            throw new Error(deleteWinner.error.message);
         }

         const absentAttendant = await admin
            .from('lucky_draw_attendants')
            .select('custom_metadata')
            .eq('id', absentAttendantId)
            .maybeSingle();

         const baseMetadata =
            typeof absentAttendant.data?.custom_metadata === 'object' &&
            absentAttendant.data.custom_metadata !== null &&
            !Array.isArray(absentAttendant.data.custom_metadata)
               ? (absentAttendant.data.custom_metadata as Record<string, unknown>)
               : {};

         // Set `has_won = false` so the absent attendant does NOT appear as a winner in tables/exports,
         // while recording `is_absent_forfeited: true` in metadata so they are excluded from future draws.
         const absentUpdate = await admin
            .from('lucky_draw_attendants')
            .update({
               has_won: false,
               custom_metadata: {
                  ...baseMetadata,
                  is_absent_forfeited: true,
               } as AdminWeb.Database.Instance['public']['Tables']['lucky_draw_attendants']['Update']['custom_metadata'],
            })
            .eq('id', absentAttendantId)
            .eq('game_id', gameId);

         if (absentUpdate.error) {
            throw new Error(absentUpdate.error.message);
         }

         const restoredRemaining = Math.min(currentPrize.total_quantity, currentPrize.remaining_quantity + 1);

         const restoredPrize = await admin
            .from('lucky_draw_prizes')
            .update({ remaining_quantity: restoredRemaining })
            .eq('id', currentPrize.id)
            .select(PRIZE_COLUMNS)
            .single<Types.Prize>();

         if (!restoredPrize.error && restoredPrize.data) {
            currentPrize = restoredPrize.data;
         }

         revokedWinnerRecordId = existingWinner.data.id;
         revokedAttendantId = absentAttendantId;
      }

      if (currentPrize.remaining_quantity <= 0) {
         throw new Error('services.game_lucky_draw.draw.prize_depleted');
      }

      const allCandidateRows: Types.Attendant[] = [];
      let offset = 0;

      while (true) {
         const poolQuery = await admin
            .from('lucky_draw_attendants')
            .select(ATTENDANT_COLUMNS)
            .eq('game_id', gameId)
            .eq('is_checked_in', true)
            .eq('has_won', false)
            .eq('is_draw_eligible', true)
            .order('id', { ascending: true })
            .range(offset, offset + ELIGIBLE_POOL_PAGE_SIZE - 1)
            .returns<Types.Attendant[]>();

         if (poolQuery.error) {
            throw new Error(poolQuery.error.message);
         }

         const rows = poolQuery.data ?? [];
         allCandidateRows.push(...rows);

         if (rows.length < ELIGIBLE_POOL_PAGE_SIZE) {
            break;
         }

         offset += ELIGIBLE_POOL_PAGE_SIZE;
      }

      const excludedSet = new Set<string>([
         ...excludeAttendantIds.map(normalizeUuid),
         ...(revokedAttendantId ? [normalizeUuid(revokedAttendantId)] : []),
      ]);

      const eligiblePool = allCandidateRows.filter(
         (attendant) =>
            !excludedSet.has(normalizeUuid(attendant.id)) && !isAbsentForfeited(attendant.custom_metadata),
      );

      if (eligiblePool.length === 0) {
         throw new Error('services.game_lucky_draw.draw.no_eligible_attendants');
      }

      const eligibleById = new Map(eligiblePool.map((item) => [normalizeUuid(item.id), item]));

      // Step 1: Check `currentPrize.designated_attendant_ids` in priority rank order (#1, #2, #3...).
      let picked: Types.Attendant | null = null;
      const designatedIds = normalizeUuidList(currentPrize.designated_attendant_ids);

      for (const attendantId of designatedIds) {
         const candidate = eligibleById.get(attendantId);
         if (candidate) {
            picked = candidate;
            break;
         }
      }

      // Step 2: Fallback to random draw with strict cross-prize reservation protection.
      if (!picked) {
         const otherPrizesQuery = await admin
            .from('lucky_draw_prizes')
            .select('id, remaining_quantity, designated_attendant_ids')
            .eq('game_id', gameId)
            .neq('id', currentPrize.id);

         if (otherPrizesQuery.error) {
            throw new Error(otherPrizesQuery.error.message);
         }

         const reservedForAnyOtherPrize = new Set<string>();
         const reservedForActiveOtherPrizes = new Set<string>();
         const strictlyReservedForActiveOtherPrizes = new Set<string>();

         for (const otherPrize of otherPrizesQuery.data ?? []) {
            const otherDesignatedIds = normalizeUuidList(otherPrize.designated_attendant_ids);
            const isOtherPrizeActive = (otherPrize.remaining_quantity ?? 0) > 0;
            let activeSlotsProtected = 0;

            for (const reservedId of otherDesignatedIds) {
               reservedForAnyOtherPrize.add(reservedId);

               if (isOtherPrizeActive) {
                  reservedForActiveOtherPrizes.add(reservedId);

                  if (activeSlotsProtected < otherPrize.remaining_quantity && eligibleById.has(reservedId)) {
                     strictlyReservedForActiveOtherPrizes.add(reservedId);
                     activeSlotsProtected += 1;
                  }
               }
            }
         }

         // Tier 1: Never pick anyone designated to ANY other prize while unreserved eligible guests exist.
         const unreservedPool = eligiblePool.filter(
            (attendant) => !reservedForAnyOtherPrize.has(normalizeUuid(attendant.id)),
         );
         // Tier 2: Protect all guests designated to other active prizes (remaining_quantity > 0).
         const notActiveReservedPool =
            unreservedPool.length > 0
               ? unreservedPool
               : eligiblePool.filter((attendant) => !reservedForActiveOtherPrizes.has(normalizeUuid(attendant.id)));
         // Tier 3: Protect top `remaining_quantity` eligible slots of every other active prize before touching excess backups.
         const notStrictlyReservedPool =
            notActiveReservedPool.length > 0
               ? notActiveReservedPool
               : eligiblePool.filter(
                    (attendant) => !strictlyReservedForActiveOtherPrizes.has(normalizeUuid(attendant.id)),
                 );

         const randomPool = notStrictlyReservedPool.length > 0 ? notStrictlyReservedPool : eligiblePool;
         picked = randomPool[randomInt(0, randomPool.length)];
      }

      // 1. Atomically decrement remaining_quantity (guarded by remaining_quantity > 0).
      const prizeUpdate = await admin
         .from('lucky_draw_prizes')
         .update({
            remaining_quantity: currentPrize.remaining_quantity - 1,
         })
         .eq('id', currentPrize.id)
         .eq('game_id', gameId)
         .gt('remaining_quantity', 0)
         .select(PRIZE_COLUMNS)
         .maybeSingle<Types.Prize>();

      if (prizeUpdate.error || !prizeUpdate.data) {
         throw new Error('services.game_lucky_draw.draw.prize_depleted');
      }

      // 2. Mark winner attendant `has_won = true`.
      const attendantUpdate = await admin
         .from('lucky_draw_attendants')
         .update({ has_won: true })
         .eq('id', picked.id)
         .eq('game_id', gameId)
         .eq('has_won', false)
         .eq('is_draw_eligible', true)
         .select(ATTENDANT_COLUMNS)
         .maybeSingle<Types.Attendant>();

      if (attendantUpdate.error || !attendantUpdate.data) {
         await admin
            .from('lucky_draw_prizes')
            .update({ remaining_quantity: currentPrize.remaining_quantity })
            .eq('id', currentPrize.id);

         throw new Error('services.game_lucky_draw.draw.draw_conflict');
      }

      // 3. Insert into immutable `lucky_draw_winners` ledger.
      const winnerInsert = await admin
         .from('lucky_draw_winners')
         .insert({
            game_id: gameId,
            prize_id: currentPrize.id,
            attendant_id: picked.id,
            drawn_by: user.id,
         })
         .select('id, game_id, prize_id, attendant_id, drawn_by, won_at')
         .single<Types.Winner_Record>();

      if (winnerInsert.error || !winnerInsert.data) {
         await Promise.all([
            admin.from('lucky_draw_attendants').update({ has_won: false }).eq('id', picked.id),
            admin
               .from('lucky_draw_prizes')
               .update({ remaining_quantity: currentPrize.remaining_quantity })
               .eq('id', currentPrize.id),
         ]);

         throw new Error(winnerInsert.error?.message || 'services.game_lucky_draw.draw.draw_conflict');
      }

      // 4. Append `PRIZE_DRAWN` audit log.
      await admin.from('logs').insert({
         account_id: user.id,
         event_id: game.data.event_id,
         game_id: gameId,
         action_type: 'PRIZE_DRAWN',
         target_entity: 'lucky_draw_winners',
         target_id: winnerInsert.data.id,
         metadata: {
            prize_id: currentPrize.id,
            prize_name: currentPrize.name,
            attendant_id: picked.id,
            ticket_code: picked.ticket_code,
            revoked_winner_id: revokedWinnerRecordId,
         },
      });

      const { custom_metadata: _ignored, ...cleanAttendant } = attendantUpdate.data;
      void _ignored;

      return {
         winner: winnerInsert.data,
         attendant: cleanAttendant,
         prize: prizeUpdate.data,
         revokedWinnerRecordId,
         revokedAttendantId,
      };
   });

   return result;
};
