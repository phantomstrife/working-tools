'use server';

import { getEmailService } from '@admin-web/adapters/email';
import { EMAIL_REGEX } from '@admin-web/services/game-lucky-draw/attendant-import-csv/constants';
import { verifyGameAccess } from '@admin-web/services/game-lucky-draw/verify-game-access';
import { trycatchAsync } from '@admin-web/utilities/trycatch';

import { buildAttendantTicketEmail } from './template';

import type * as Types from './type';

const UPDATE_CHUNK_SIZE = 200;

export const useServicesGameLuckyDrawAttendantSendEmails: Types.Service = async (request) => {
   return trycatchAsync(async () => {
      const uniqueIds = Array.from(new Set(request.attendantIds.filter(Boolean)));

      if (uniqueIds.length === 0) {
         throw new Error('services.game_lucky_draw.attendant.no_selection');
      }

      const access = await verifyGameAccess({ gameId: request.gameId });

      if (access.error) {
         throw new Error(access.message);
      }

      const { supabase, userId, game, event } = access.data;
      const emailService = getEmailService();

      const attendants: Array<{
         id: string;
         full_name: string;
         ticket_code: string;
         email: string | null;
         qr_code_payload: string;
      }> = [];

      for (let i = 0; i < uniqueIds.length; i += UPDATE_CHUNK_SIZE) {
         const idChunk = uniqueIds.slice(i, i + UPDATE_CHUNK_SIZE);
         const query = await supabase
            .from('lucky_draw_attendants')
            .select('id, full_name, ticket_code, email, qr_code_payload')
            .eq('game_id', request.gameId)
            .in('id', idChunk);

         if (query.error) {
            throw new Error(query.error.message);
         }

         attendants.push(...(query.data ?? []));
      }

      if (attendants.length === 0) {
         throw new Error('services.game_lucky_draw.attendant.not_found');
      }

      const sendableAttendants = attendants.filter(
         (attendant) => Boolean(attendant.email) && EMAIL_REGEX.test(attendant.email!.trim()),
      );
      const invalidEmailIds = attendants
         .filter((attendant) => !attendant.email || !EMAIL_REGEX.test(attendant.email.trim()))
         .map((attendant) => attendant.id);

      const sendableIds = sendableAttendants.map((attendant) => attendant.id);
      const nowIso = new Date().toISOString();

      for (let i = 0; i < sendableIds.length; i += UPDATE_CHUNK_SIZE) {
         const chunk = sendableIds.slice(i, i + UPDATE_CHUNK_SIZE);
         const sendingUpdate = await supabase
            .from('lucky_draw_attendants')
            .update({
               email_status: 'SENDING',
               updated_at: nowIso,
            })
            .eq('game_id', request.gameId)
            .in('id', chunk);

         if (sendingUpdate.error) {
            throw new Error(sendingUpdate.error.message);
         }
      }

      const sentIds: string[] = [];
      const failedIds: string[] = [...invalidEmailIds];

      try {
         if (sendableAttendants.length > 0) {
            const messages = sendableAttendants.map((attendant) => {
               const content = buildAttendantTicketEmail({
                  fullName: attendant.full_name,
                  ticketCode: attendant.ticket_code,
                  qrCodePayload: attendant.qr_code_payload,
                  eventName: event.name,
                  gameName: game.name,
                  locationName: event.location_name,
                  startTime: event.start_time,
               });

               return {
                  to: attendant.email!.trim(),
                  subject: content.subject,
                  html: content.html,
                  text: content.text,
               };
            });

            const dispatchResults = await emailService.sendBatchEmails(messages);

            dispatchResults.forEach((dispatchResult, index) => {
               const attendant = sendableAttendants[index];
               if (!attendant) {
                  return;
               }

               if (dispatchResult.success) {
                  sentIds.push(attendant.id);
               } else {
                  failedIds.push(attendant.id);
               }
            });
         }
      } catch (dispatchError) {
         const rollbackTime = new Date().toISOString();

         for (let i = 0; i < sendableIds.length; i += UPDATE_CHUNK_SIZE) {
            const chunk = sendableIds.slice(i, i + UPDATE_CHUNK_SIZE);
            await supabase
               .from('lucky_draw_attendants')
               .update({
                  email_status: 'FAILED',
                  updated_at: rollbackTime,
               })
               .eq('game_id', request.gameId)
               .in('id', chunk);
         }

         throw dispatchError;
      }

      const finishedIso = new Date().toISOString();

      for (let i = 0; i < sentIds.length; i += UPDATE_CHUNK_SIZE) {
         const chunk = sentIds.slice(i, i + UPDATE_CHUNK_SIZE);
         await supabase
            .from('lucky_draw_attendants')
            .update({
               email_status: 'SENT',
               email_sent_at: finishedIso,
               updated_at: finishedIso,
            })
            .eq('game_id', request.gameId)
            .in('id', chunk);
      }

      for (let i = 0; i < failedIds.length; i += UPDATE_CHUNK_SIZE) {
         const chunk = failedIds.slice(i, i + UPDATE_CHUNK_SIZE);
         await supabase
            .from('lucky_draw_attendants')
            .update({
               email_status: 'FAILED',
               updated_at: finishedIso,
            })
            .eq('game_id', request.gameId)
            .in('id', chunk);
      }

      await supabase.from('logs').insert({
         account_id: userId,
         event_id: event.id,
         game_id: game.id,
         action_type: 'EMAIL_BATCH_SEND',
         target_entity: 'lucky_draw_attendants',
         metadata: {
            provider: emailService.provider,
            requested_count: attendants.length,
            sent_count: sentIds.length,
            failed_count: failedIds.length,
         },
      });

      return {
         provider: emailService.provider,
         totalRequested: attendants.length,
         sentCount: sentIds.length,
         failedCount: failedIds.length,
      };
   });
};

