'use server';

import { getAttendantClient } from '@admin-web/adapters/supabase/attendant';
import { EMAIL_REGEX } from '@admin-web/services/game-lucky-draw/attendant-import-csv/constants';
import { trycatchAsync } from '@admin-web/utilities/trycatch';
import { verifyVipAccommodationToken } from '@admin-web/utilities/vip-accommodation-token';

import { VIP_ATTENDANT_COLUMNS } from './constants';

import type * as Types from './type';

interface AttendantRow {
   id: string;
   game_id: string;
   full_name: string;
   citizen_id: string | null;
   email: string | null;
   phone: string | null;
   ticket_code: string;
   accommodation: boolean | null;
   custom_metadata: AdminWeb.Database.GameLuckyDrawAttendant['custom_metadata'];
}

interface GameEventRow {
   id: string;
   name: string;
   event:
      | {
           name: string;
           location_name: string | null;
           start_time: string;
        }
      | {
           name: string;
           location_name: string | null;
           start_time: string;
        }[]
      | null;
}

const getMetadataObject = (
   customMetadata: AdminWeb.Database.GameLuckyDrawAttendant['custom_metadata'],
): Record<string, unknown> => {
   if (typeof customMetadata === 'object' && customMetadata !== null && !Array.isArray(customMetadata)) {
      return customMetadata as Record<string, unknown>;
   }

   return {};
};

const toVipAttendantInfo = (
   row: AttendantRow,
   eventMeta: { eventName: string; gameName: string; locationName: string | null; startTime: string | null },
): Types.VipAttendantInfo => {
   const metadata = getMetadataObject(row.custom_metadata);

   return {
      id: row.id,
      full_name: row.full_name,
      citizen_id: row.citizen_id,
      email: row.email,
      phone: row.phone,
      ticket_code: row.ticket_code,
      eventName: eventMeta.eventName,
      gameName: eventMeta.gameName,
      locationName: eventMeta.locationName,
      startTime: eventMeta.startTime,
      accommodationConfirmed: metadata.accommodation_confirmed === true,
   };
};

const resolveVerifiedVipAttendant = async (token: string) => {
   const verified = verifyVipAccommodationToken(token);

   if (!verified) {
      throw new Error('services.game_lucky_draw.attendant.vip_link_invalid');
   }

   const anonClient = getAttendantClient(verified.attendantId);

   const [attendantQuery, gameQuery] = await Promise.all([
      anonClient
         .from('lucky_draw_attendants')
         .select(VIP_ATTENDANT_COLUMNS)
         .eq('id', verified.attendantId)
         .eq('game_id', verified.gameId)
         .maybeSingle<AttendantRow>(),
      anonClient
         .from('games')
         .select(
            `
            id,
            name,
            event:events!games_event_id_fkey (
               name,
               location_name,
               start_time
            )
         `,
         )
         .eq('id', verified.gameId)
         .maybeSingle<GameEventRow>(),
   ]);

   if (attendantQuery.error || !attendantQuery.data) {
      throw new Error('services.game_lucky_draw.attendant.not_found');
   }

   if (attendantQuery.data.accommodation !== true) {
      throw new Error('services.game_lucky_draw.attendant.vip_not_eligible');
   }

   const eventData = Array.isArray(gameQuery.data?.event) ? gameQuery.data?.event[0] : gameQuery.data?.event;

   return {
      anonClient,
      attendant: attendantQuery.data,
      eventMeta: {
         eventName: eventData?.name ?? '',
         gameName: gameQuery.data?.name ?? '',
         locationName: eventData?.location_name ?? null,
         startTime: eventData?.start_time ?? null,
      },
   };
};

/**
 * Reads public-safe VIP accommodation details using a signed link token and anon RLS.
 */
export const useServicesGameLuckyDrawVipAccommodationRead: Types.ReadService = async (request) => {
   return trycatchAsync(async () => {
      const { attendant, eventMeta } = await resolveVerifiedVipAttendant(request.token);

      return {
         attendant: toVipAttendantInfo(attendant, eventMeta),
      };
   });
};

/**
 * Verifies and confirms the VIP attendant's existing accommodation details via anon RLS.
 */
export const useServicesGameLuckyDrawVipAccommodationConfirm: Types.ConfirmService = async (request) => {
   return trycatchAsync(async () => {
      const { attendant, eventMeta } = await resolveVerifiedVipAttendant(request.token);

      return {
         attendant: {
            ...toVipAttendantInfo(attendant, eventMeta),
            accommodationConfirmed: true,
         },
      };
   });
};

/**
 * Updates only citizen_id, full_name, email, and phone via anon RLS and database trigger.
 */
export const useServicesGameLuckyDrawVipAccommodationUpdate: Types.UpdateService = async (request) => {
   return trycatchAsync(async () => {
      const { anonClient, attendant, eventMeta } = await resolveVerifiedVipAttendant(request.token);

      const trimmedFullName = request.full_name.trim();
      if (!trimmedFullName) {
         throw new Error('services.game_lucky_draw.attendant.vip_missing_full_name');
      }

      const normalizedEmail = request.email?.trim() || null;
      if (normalizedEmail && !EMAIL_REGEX.test(normalizedEmail)) {
         throw new Error('services.game_lucky_draw.attendant.vip_invalid_email');
      }

      const normalizedCitizenId = request.citizen_id?.trim() || null;
      const normalizedPhone = request.phone?.trim() || null;

      // Enforce allowed column updates through anon RLS (`x-attendant-id`) and BEFORE UPDATE trigger.
      const updated = await anonClient
         .from('lucky_draw_attendants')
         .update({
            full_name: trimmedFullName,
            citizen_id: normalizedCitizenId,
            email: normalizedEmail,
            phone: normalizedPhone,
         })
         .eq('id', attendant.id)
         .eq('game_id', attendant.game_id)
         .select(VIP_ATTENDANT_COLUMNS)
         .single<AttendantRow>();

      if (updated.error || !updated.data) {
         throw new Error(updated.error?.message || 'services.game_lucky_draw.attendant.save_failed');
      }

      return {
         attendant: toVipAttendantInfo(updated.data, eventMeta),
      };
   });
};
