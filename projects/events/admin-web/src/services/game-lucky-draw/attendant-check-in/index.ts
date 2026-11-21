import { getAdminClient } from '@admin-web/adapters/supabase/admin';
import { getTokenClient } from '@admin-web/adapters/supabase/token';
import { normalizeSalutation } from '@admin-web/services/game-lucky-draw/attendant-import-csv/constants';
import { trycatchAsync } from '@admin-web/utilities/trycatch';

import { ALLOWED_ROLES, ATTENDANT_COLUMNS, LOG_ACTION } from './constants';

import type * as Types from './type';

export const useServicesGameLuckyDrawAttendantCheckIn: Types.Service = async (request) => {
   const {
      accessToken,
      gameId,
      method,
      action = 'CONFIRM',
      qrCodePayload = '',
      attendantId = '',
      searchQuery = '',
      representativeSalutation,
      representative,
      representativePhone,
   } = request;

   const result = await trycatchAsync(async () => {
      if (!accessToken) {
         throw new Error('services.user.unauthenticated');
      }

      if (
         !gameId ||
         (action !== 'LOOKUP' && action !== 'CONFIRM') ||
         (method === 'QR_SCAN' && !qrCodePayload && !attendantId) ||
         (method === 'MANUAL_SEARCH' && !attendantId)
      ) {
         throw new Error('services.game_lucky_draw.check_in.missing_fields');
      }

      const supabase = getTokenClient(accessToken);
      const auth = await supabase.auth.getUser(accessToken);
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

      const role = account.data.role as Types.Account_Role;

      if (!ALLOWED_ROLES.includes(role)) {
         throw new Error('services.user.access_denied');
      }

      const game = await supabase.from('games').select('id, event_id, is_dev_only').eq('id', gameId).maybeSingle();

      if (game.error || !game.data) {
         throw new Error('services.game_lucky_draw.game_not_found');
      }

      if (role !== 'SUPER_ADMIN') {
         if (game.data.is_dev_only) {
            throw new Error('services.game_lucky_draw.game_not_found');
         }

         const event = await supabase
            .from('events')
            .select('id, company_id')
            .eq('id', game.data.event_id)
            .maybeSingle();

         if (event.error || !event.data) {
            throw new Error('services.game_lucky_draw.check_in.game_not_assigned');
         }

         if (role === 'ADMIN') {
            if (!account.data.company_id || event.data.company_id !== account.data.company_id) {
               throw new Error('services.game_lucky_draw.check_in.game_not_assigned');
            }
         } else {
            if (account.data.company_id && event.data.company_id !== account.data.company_id) {
               throw new Error('services.game_lucky_draw.check_in.game_not_assigned');
            }

            const assignment = await supabase
               .from('game_accounts')
               .select('id')
               .eq('game_id', gameId)
               .eq('event_id', game.data.event_id)
               .eq('account_id', user.id)
               .maybeSingle();

            if (assignment.error || !assignment.data) {
               throw new Error('services.game_lucky_draw.check_in.game_not_assigned');
            }
         }
      }

      const payload = qrCodePayload.trim();

      if (method === 'QR_SCAN' && payload) {
         const [payloadGameId, payloadTicket, payloadNonce] = payload.split(':');

         if (!payloadGameId || !payloadTicket || !payloadNonce) {
            throw new Error('services.game_lucky_draw.check_in.invalid_qr');
         }

         if (payloadGameId !== gameId) {
            throw new Error('services.game_lucky_draw.check_in.qr_wrong_game');
         }
      }

      const adminSupabase = getAdminClient();
      const lookupQuery = adminSupabase
         .from('lucky_draw_attendants')
         .select(ATTENDANT_COLUMNS)
         .eq('game_id', gameId);
      const lookup = await (
         method === 'QR_SCAN' && payload
            ? lookupQuery.eq('qr_code_payload', payload)
            : lookupQuery.eq('id', attendantId)
      ).maybeSingle<Types.Attendant>();

      if (lookup.error || !lookup.data) {
         throw new Error('services.game_lucky_draw.check_in.attendant_not_found');
      }

      const attendantData = lookup.data;

      if (action === 'LOOKUP') {
         if (attendantData.is_checked_in) {
            return {
               status: 'ALREADY_CHECKED_IN' as const,
               attendant: attendantData,
            };
         }

         return {
            status: 'PENDING_CONFIRMATION' as const,
            attendant: attendantData,
         };
      }

      if (attendantData.is_checked_in) {
         return {
            status: 'ALREADY_CHECKED_IN' as const,
            attendant: attendantData,
         };
      }

      const nowIso = new Date().toISOString();
      const hasRepresentativeSalutationField = representativeSalutation !== undefined;
      const parsedRepresentativeSalutation = hasRepresentativeSalutationField
         ? normalizeSalutation(representativeSalutation)
         : undefined;

      if (parsedRepresentativeSalutation === 'invalid') {
         throw new Error('services.game_lucky_draw.attendant.invalid_representative_salutation');
      }

      const nextRepresentativeSalutation = hasRepresentativeSalutationField
         ? (parsedRepresentativeSalutation ?? null)
         : attendantData.representative_salutation;
      const representativeSalutationChanged =
         hasRepresentativeSalutationField &&
         nextRepresentativeSalutation !== attendantData.representative_salutation;

      const hasRepresentativeField = representative !== undefined;
      const hasRepresentativePhoneField = representativePhone !== undefined;
      const nextRepresentative = hasRepresentativeField
         ? representative?.trim() || null
         : attendantData.representative;
      const nextRepresentativePhone = hasRepresentativePhoneField
         ? representativePhone?.trim() || null
         : attendantData.representative_phone;
      const representativeChanged =
         representativeSalutationChanged ||
         nextRepresentative !== attendantData.representative ||
         nextRepresentativePhone !== attendantData.representative_phone;

      // Conditional update guards against two guards scanning the same ticket at the same time.
      const update = await adminSupabase
         .from('lucky_draw_attendants')
         .update({
            is_checked_in: true,
            checked_in_at: nowIso,
            checked_in_by: user.id,
            check_in_method: method,
            ...(representativeChanged
               ? {
                    representative_salutation: nextRepresentativeSalutation,
                    representative: nextRepresentative,
                    representative_phone: nextRepresentativePhone,
                 }
               : {}),
         })
         .eq('id', attendantData.id)
         .eq('game_id', gameId)
         .eq('is_checked_in', false)
         .select(ATTENDANT_COLUMNS)
         .maybeSingle<Types.Attendant>();

      if (update.error) {
         throw new Error(update.error.message);
      }

      if (!update.data) {
         const latest = await adminSupabase
            .from('lucky_draw_attendants')
            .select(ATTENDANT_COLUMNS)
            .eq('id', attendantData.id)
            .single<Types.Attendant>();

         return {
            status: 'ALREADY_CHECKED_IN' as const,
            attendant: latest.data ?? attendantData,
         };
      }

      const logEntries: AdminWeb.Database.Instance['public']['Tables']['logs']['Insert'][] = [
         {
            account_id: user.id,
            event_id: game.data.event_id,
            game_id: gameId,
            action_type: LOG_ACTION[method],
            target_entity: 'lucky_draw_attendants',
            target_id: update.data.id,
            metadata: {
               ticket_code: update.data.ticket_code,
               representative_salutation: nextRepresentativeSalutation,
               previous_representative_salutation: attendantData.representative_salutation,
               representative: nextRepresentative,
               previous_representative: attendantData.representative,
               representative_phone: nextRepresentativePhone,
               previous_representative_phone: attendantData.representative_phone,
               ...(method === 'MANUAL_SEARCH' ? { search_query: searchQuery } : {}),
            },
         },
      ];

      if (representativeChanged) {
         const guardChanges: Record<string, { from: string | null; to: string | null }> = {};

         if (representativeSalutationChanged) {
            guardChanges.representative_salutation = {
               from: attendantData.representative_salutation,
               to: nextRepresentativeSalutation,
            };
         }

         if (nextRepresentative !== attendantData.representative) {
            guardChanges.representative = {
               from: attendantData.representative,
               to: nextRepresentative,
            };
         }

         if (nextRepresentativePhone !== attendantData.representative_phone) {
            guardChanges.representative_phone = {
               from: attendantData.representative_phone,
               to: nextRepresentativePhone,
            };
         }

         logEntries.push({
            account_id: user.id,
            event_id: game.data.event_id,
            game_id: gameId,
            action_type: 'ATTENDANT_GUARD_EDIT',
            target_entity: 'lucky_draw_attendants',
            target_id: update.data.id,
            metadata: {
               ticket_code: update.data.ticket_code,
               source: 'QR_CHECK_IN',
               changes: guardChanges,
            },
         });
      }

      await adminSupabase.from('logs').insert(logEntries);

      return {
         status: 'CHECKED_IN' as const,
         attendant: update.data,
      };
   });

   return result;
};
