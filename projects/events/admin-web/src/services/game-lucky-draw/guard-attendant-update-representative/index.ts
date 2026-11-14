'use server';

import { getAdminClient } from '@admin-web/adapters/supabase/admin';
import { getServerClient } from '@admin-web/adapters/supabase/server';
import { trycatchAsync } from '@admin-web/utilities/trycatch';

import { ATTENDANT_COLUMNS } from './constants';

import type * as Types from './type';

const ALLOWED_ROLES: AdminWeb.Database.Account_Role[] = ['GUARD', 'ADMIN', 'SUPER_ADMIN'];

type Attendant_With_Metadata = Types.Attendant & {
   custom_metadata: AdminWeb.Database.GameLuckyDrawAttendant['custom_metadata'];
};

export const useServicesGameLuckyDrawGuardAttendantUpdateRepresentative: Types.Service = async (request) => {
   const { gameId, attendantId, representative } = request;

   const result = await trycatchAsync(async () => {
      const normalizedRepresentative = representative?.trim() || null;

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
         .select(`${ATTENDANT_COLUMNS}, custom_metadata`)
         .eq('id', attendantId)
         .eq('game_id', gameId)
         .maybeSingle<Attendant_With_Metadata>();

      if (current.error) {
         throw new Error(current.error.message);
      }

      if (!current.data) {
         throw new Error('services.game_lucky_draw.attendant.not_found');
      }

      const representativeChanged = normalizedRepresentative !== current.data.representative;

      if (!representativeChanged) {
         return {
            id: current.data.id,
            full_name: current.data.full_name,
            ticket_code: current.data.ticket_code,
            email: current.data.email,
            phone: current.data.phone,
            company_name: current.data.company_name,
            department: current.data.department,
            representative: current.data.representative,
            is_checked_in: current.data.is_checked_in,
            checked_in_at: current.data.checked_in_at,
            check_in_method: current.data.check_in_method,
         };
      }

      const existingMetadata =
         current.data.custom_metadata &&
         typeof current.data.custom_metadata === 'object' &&
         !Array.isArray(current.data.custom_metadata)
            ? (current.data.custom_metadata as Record<string, unknown>)
            : {};
      const existingHistory = Array.isArray(existingMetadata.representative_history)
         ? existingMetadata.representative_history
         : [];

      const nextCustomMetadata = {
         ...existingMetadata,
         representative_history: [
            ...existingHistory,
            {
               previous: current.data.representative,
               next: normalizedRepresentative,
               updated_by: user.id,
               updated_at: new Date().toISOString(),
               source: 'GUARD_EDIT',
            },
         ],
      };

      const query = await adminSupabase
         .from('lucky_draw_attendants')
         .update({
            representative: normalizedRepresentative,
            custom_metadata: nextCustomMetadata as AdminWeb.Database.GameLuckyDrawAttendant['custom_metadata'],
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

      return query.data;
   });

   return result;
};
