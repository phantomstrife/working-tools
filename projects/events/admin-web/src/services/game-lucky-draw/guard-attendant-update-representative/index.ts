'use server';

import { getAdminClient } from '@admin-web/adapters/supabase/admin';
import { getServerClient } from '@admin-web/adapters/supabase/server';
import { normalizeSalutation } from '@admin-web/services/game-lucky-draw/attendant-import-csv/constants';
import { trycatchAsync } from '@admin-web/utilities/trycatch';

import { ATTENDANT_COLUMNS } from './constants';

import type * as Types from './type';

const ALLOWED_ROLES: AdminWeb.Database.Account_Role[] = ['GUARD', 'ADMIN', 'SUPER_ADMIN'];

export const useServicesGameLuckyDrawGuardAttendantUpdateRepresentative: Types.Service = async (request) => {
   const { gameId, attendantId, representativeSalutation, representative, representativePhone } = request;

   const result = await trycatchAsync(async () => {
      const normalizedRepresentative = representative?.trim() || null;
      const normalizedRepresentativePhone = representativePhone?.trim() || null;
      const hasRepresentativeSalutationField = representativeSalutation !== undefined;
      const parsedRepresentativeSalutation = hasRepresentativeSalutationField
         ? normalizeSalutation(representativeSalutation)
         : undefined;

      if (parsedRepresentativeSalutation === 'invalid') {
         throw new Error('services.game_lucky_draw.attendant.invalid_representative_salutation');
      }

      if (!gameId || !attendantId) {
         throw new Error('services.game_lucky_draw.attendant.not_found');
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

      const role = account.data.role as AdminWeb.Database.Account_Role;

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

      const adminSupabase = getAdminClient();
      const current = await adminSupabase
         .from('lucky_draw_attendants')
         .select(ATTENDANT_COLUMNS)
         .eq('id', attendantId)
         .eq('game_id', gameId)
         .maybeSingle<Types.Attendant>();

      if (current.error) {
         throw new Error(current.error.message);
      }

      if (!current.data) {
         throw new Error('services.game_lucky_draw.attendant.not_found');
      }

      const nextRepresentativeSalutation = hasRepresentativeSalutationField
         ? (parsedRepresentativeSalutation ?? null)
         : current.data.representative_salutation;
      const representativeSalutationChanged =
         hasRepresentativeSalutationField &&
         nextRepresentativeSalutation !== current.data.representative_salutation;
      const representativeChanged =
         representativeSalutationChanged ||
         normalizedRepresentative !== current.data.representative ||
         normalizedRepresentativePhone !== current.data.representative_phone;

      if (!representativeChanged) {
         return current.data;
      }

      const query = await adminSupabase
         .from('lucky_draw_attendants')
         .update({
            representative: normalizedRepresentative,
            representative_phone: normalizedRepresentativePhone,
            ...(representativeSalutationChanged ? { representative_salutation: nextRepresentativeSalutation } : {}),
         })
         .eq('id', attendantId)
         .eq('game_id', gameId)
         .select(ATTENDANT_COLUMNS)
         .maybeSingle<Types.Attendant>();

      if (query.error) {
         throw new Error(query.error.message);
      }

      if (!query.data) {
         throw new Error('services.game_lucky_draw.attendant.not_found');
      }

      const changes: Record<string, { from: string | null; to: string | null }> = {};

      if (representativeSalutationChanged) {
         changes.representative_salutation = {
            from: current.data.representative_salutation,
            to: nextRepresentativeSalutation,
         };
      }

      if (normalizedRepresentative !== current.data.representative) {
         changes.representative = {
            from: current.data.representative,
            to: normalizedRepresentative,
         };
      }

      if (normalizedRepresentativePhone !== current.data.representative_phone) {
         changes.representative_phone = {
            from: current.data.representative_phone,
            to: normalizedRepresentativePhone,
         };
      }

      await adminSupabase.from('logs').insert({
         account_id: user.id,
         event_id: game.data.event_id,
         game_id: gameId,
         action_type: 'ATTENDANT_GUARD_EDIT',
         target_entity: 'lucky_draw_attendants',
         target_id: query.data.id,
         metadata: {
            ticket_code: query.data.ticket_code,
            source: 'GUARD_EDIT',
            changes,
         },
      });

      return query.data;
   });

   return result;
};
