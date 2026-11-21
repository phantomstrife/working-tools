'use server';

import { normalizeSalutation } from '@admin-web/services/game-lucky-draw/attendant-import-csv/constants';
import { verifyGameAccess } from '@admin-web/services/game-lucky-draw/verify-game-access';
import { generateQrCodePayload } from '@admin-web/utilities/qr-code';
import { trycatchAsync } from '@admin-web/utilities/trycatch';

import type * as Types from './type';

export const useServicesGameLuckyDrawAttendantSave: Types.Service = async (request) => {
   return trycatchAsync(async () => {
      const access = await verifyGameAccess({ gameId: request.gameId });

      if (access.error) {
         throw new Error(access.message);
      }

      const { supabase } = access.data;
      const trimmedFullName = request.full_name.trim();
      const trimmedTicketCode = request.ticket_code.trim();
      const normalizedSalutation = normalizeSalutation(request.salutation);
      const normalizedRepresentativeSalutation = normalizeSalutation(request.representative_salutation);

      if (!trimmedFullName || !trimmedTicketCode) {
         throw new Error('services.game_lucky_draw.attendant.missing_required_fields');
      }

      if (normalizedSalutation === 'invalid') {
         throw new Error('services.game_lucky_draw.attendant.invalid_salutation');
      }

      if (normalizedRepresentativeSalutation === 'invalid') {
         throw new Error('services.game_lucky_draw.attendant.invalid_representative_salutation');
      }

      let duplicateQuery = supabase
         .from('lucky_draw_attendants')
         .select('id')
         .eq('game_id', request.gameId)
         .eq('ticket_code', trimmedTicketCode);

      if (request.id) {
         duplicateQuery = duplicateQuery.neq('id', request.id);
      }

      const duplicateCheck = await duplicateQuery.maybeSingle();

      if (duplicateCheck.error) {
         throw new Error(duplicateCheck.error.message);
      }

      if (duplicateCheck.data) {
         throw new Error('services.game_lucky_draw.attendant.duplicate_ticket_code');
      }

      const normalizedPayload = {
         salutation: normalizedSalutation,
         full_name: trimmedFullName,
         citizen_id: request.citizen_id?.trim() || null,
         ticket_code: trimmedTicketCode,
         email: request.email?.trim() || null,
         phone: request.phone?.trim() || null,
         company_name: request.company_name?.trim() || null,
         department: request.department?.trim() || null,
         representative_salutation: normalizedRepresentativeSalutation,
         representative: request.representative?.trim() || null,
         representative_phone: request.representative_phone?.trim() || null,
         sale_in_charge: request.sale_in_charge?.trim() || null,
         accommodation: Boolean(request.accommodation),
      };

      if (request.id) {
         const existingRecord = await supabase
            .from('lucky_draw_attendants')
            .select('id, ticket_code, email')
            .eq('id', request.id)
            .eq('game_id', request.gameId)
            .single();

         if (existingRecord.error || !existingRecord.data) {
            throw new Error('services.game_lucky_draw.attendant.not_found');
         }

         const ticketChanged = existingRecord.data.ticket_code !== trimmedTicketCode;
         const emailChanged = (existingRecord.data.email ?? null) !== normalizedPayload.email;

         const updatePayload: AdminWeb.Database.GameLuckyDrawAttendantUpdate = {
            ...normalizedPayload,
            updated_at: new Date().toISOString(),
            ...(ticketChanged ? { qr_code_payload: generateQrCodePayload(request.gameId, trimmedTicketCode) } : {}),
            ...(emailChanged ? { email_status: 'NOT_SENT', email_sent_at: null } : {}),
         };

         const updated = await supabase
            .from('lucky_draw_attendants')
            .update(updatePayload)
            .eq('id', request.id)
            .eq('game_id', request.gameId)
            .select('*')
            .single();

         if (updated.error || !updated.data) {
            throw new Error(updated.error?.message || 'services.game_lucky_draw.attendant.save_failed');
         }

         return {
            attendant: updated.data,
         };
      }

      const insertPayload: AdminWeb.Database.GameLuckyDrawAttendantInsert = {
         ...normalizedPayload,
         game_id: request.gameId,
         qr_code_payload: generateQrCodePayload(request.gameId, trimmedTicketCode),
         email_status: 'NOT_SENT',
         is_checked_in: false,
         has_won: false,
      };

      const created = await supabase.from('lucky_draw_attendants').insert(insertPayload).select('*').single();

      if (created.error || !created.data) {
         throw new Error(created.error?.message || 'services.game_lucky_draw.attendant.save_failed');
      }

      return {
         attendant: created.data,
      };
   });
};

