'use server';

import { headers } from 'next/headers';

import { getEmailService } from '@admin-web/adapters/email';
import { ROUTE } from '@admin-web/routes/constants';
import { EMAIL_REGEX } from '@admin-web/services/game-lucky-draw/attendant-import-csv/constants';
import { verifyGameAccess } from '@admin-web/services/game-lucky-draw/verify-game-access';
import { trycatchAsync } from '@admin-web/utilities/trycatch';
import { signVipAccommodationToken } from '@admin-web/utilities/vip-accommodation-token';

import { buildAttendantTicketEmail } from './template';

import type * as Types from './type';

const UPDATE_CHUNK_SIZE = 200;
const FETCH_PAGE_SIZE = 1000;

const resolveBaseUrl = async (): Promise<string> => {
   const envUrl =
      process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || process.env.APP_URL;

   if (envUrl) {
      return envUrl.replace(/\/+$/, '');
   }

   try {
      const requestHeaders = await headers();
      const origin = requestHeaders.get('origin');
      if (origin) {
         return origin.replace(/\/+$/, '');
      }

      const host = requestHeaders.get('x-forwarded-host') || requestHeaders.get('host');
      if (host) {
         const forwardedProto = requestHeaders.get('x-forwarded-proto');
         const proto =
            forwardedProto || (host.includes('localhost') || host.startsWith('127.0.0.1') ? 'http' : 'https');
         return `${proto}://${host}`;
      }
   } catch {
      // Ignore header lookup outside active HTTP request scope.
   }

   return 'http://localhost:3000';
};

export const useServicesGameLuckyDrawAttendantSendEmails: Types.Service = async (request) => {
   return trycatchAsync(async () => {
      const sendAll = Boolean(request.sendAll);
      const uniqueIds = Array.from(new Set((request.attendantIds ?? []).filter(Boolean)));

      if (!sendAll && uniqueIds.length === 0) {
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
         salutation: string | null;
         full_name: string;
         citizen_id: string | null;
         phone: string | null;
         ticket_code: string;
         email: string | null;
         qr_code_payload: string;
         accommodation: boolean | null;
      }> = [];

      if (sendAll) {
         let offset = 0;

         while (true) {
            const query = await supabase
               .from('lucky_draw_attendants')
               .select(
                  'id, salutation, full_name, citizen_id, phone, ticket_code, email, qr_code_payload, accommodation',
               )
               .eq('game_id', request.gameId)
               .range(offset, offset + FETCH_PAGE_SIZE - 1);

            if (query.error) {
               throw new Error(query.error.message);
            }

            const batch = query.data ?? [];
            attendants.push(...batch);

            if (batch.length < FETCH_PAGE_SIZE) {
               break;
            }

            offset += FETCH_PAGE_SIZE;
         }
      } else {
         for (let i = 0; i < uniqueIds.length; i += UPDATE_CHUNK_SIZE) {
            const idChunk = uniqueIds.slice(i, i + UPDATE_CHUNK_SIZE);
            const query = await supabase
               .from('lucky_draw_attendants')
               .select(
                  'id, salutation, full_name, citizen_id, phone, ticket_code, email, qr_code_payload, accommodation',
               )
               .eq('game_id', request.gameId)
               .in('id', idChunk);

            if (query.error) {
               throw new Error(query.error.message);
            }

            attendants.push(...(query.data ?? []));
         }
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
            const baseUrl = await resolveBaseUrl();
            const vipBasePath = `${baseUrl}${ROUTE.PUBLIC.VIP_ACCOMMODATION}`;

            const messages = sendableAttendants.map((attendant) => {
               const token = signVipAccommodationToken({
                  attendantId: attendant.id,
                  gameId: request.gameId,
               });
               const encodedToken = encodeURIComponent(token);
               const confirmUrl = `${vipBasePath}?token=${encodedToken}&action=confirm`;
               const editUrl = `${vipBasePath}?token=${encodedToken}&action=edit`;

               const content = buildAttendantTicketEmail({
                  salutation: attendant.salutation,
                  fullName: attendant.full_name,
                  citizenId: attendant.citizen_id,
                  email: attendant.email,
                  phone: attendant.phone,
                  ticketCode: attendant.ticket_code,
                  qrCodePayload: attendant.qr_code_payload,
                  eventName: event.name,
                  gameName: game.name,
                  locationName: event.location_name,
                  startTime: event.start_time,
                  confirmUrl,
                  editUrl,
               });

               return {
                  to: attendant.email!.trim(),
                  subject: content.subject,
                  html: content.html,
                  text: content.text,
               };
            });

            const dispatchResults = await emailService.sendBatchEmails(messages);
            console.log('Email dispatch results:', dispatchResults);

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
