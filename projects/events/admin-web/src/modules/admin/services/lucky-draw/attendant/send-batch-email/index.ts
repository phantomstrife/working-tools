'use server';

import { revalidatePath } from 'next/cache';
import QRCode from 'qrcode';

import { getServerClient } from '@/adapters/supabase/server';
import { ROUTE } from '@/constants';

import type * as Types from './type';

export const sendBatchEmail: Types.SendBatchEmail = async (request) => {
   if (request.attendantIds.length === 0) {
      return { sentCount: 0, skippedCount: 0, failedCount: 0 };
   }

   const supabase = await getServerClient();

   const authResult = await supabase.auth.getUser();
   if (!authResult.data.user) {
      throw new Error('Unauthorized.');
   }

   const callerId = authResult.data.user.id;
   const callerProfile = await supabase
      .from('accounts')
      .select('role, company_id')
      .eq('id', callerId)
      .single();

   if (callerProfile.error || !callerProfile.data) {
      throw new Error('Unable to verify caller permissions.');
   }

   const caller = callerProfile.data;
   if (caller.role !== 'SUPER_ADMIN' && caller.role !== 'ADMIN') {
      throw new Error('Only Super Admins and Admins can dispatch batch emails.');
   }

   let query = supabase
      .from('lucky_draw_attendants')
      .select('*, games!inner(id, name, event_id, is_dev_only, events!inner(id, name, company_id))')
      .in('id', request.attendantIds);

   if (caller.role === 'ADMIN') {
      if (!caller.company_id) {
         throw new Error('Admin account is not linked to a company.');
      }
      query = query.eq('games.events.company_id', caller.company_id).eq('games.is_dev_only', false);
   }

   const attendantsResult = await query;
   if (attendantsResult.error) {
      throw new Error(attendantsResult.error.message);
   }

   const attendants = attendantsResult.data ?? [];
   let sentCount = 0;
   let skippedCount = 0;
   let failedCount = 0;

   const resendApiKey = process.env.RESEND_API_KEY;
   const nowIso = new Date().toISOString();

   for (const attendant of attendants) {
      if (!attendant.email || !attendant.email.trim()) {
         skippedCount += 1;
         continue;
      }

      try {
         const qrDataUrl = await QRCode.toDataURL(attendant.qr_code_payload, {
            width: 240,
            margin: 2,
         });

         if (resendApiKey) {
            const { resend } = await import('@/adapters/resend');
            await resend.emails.send({
               from: 'Events <onboarding@resend.dev>',
               to: [attendant.email.trim()],
               subject: `Your Event Ticket & Check-In QR — ${attendant.games.events.name}`,
               html: [
                  `<div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px;border:1px solid #e4e4e7;border-radius:12px;">`,
                  `<h2 style="margin:0 0 8px;color:#09090b;">Hello ${attendant.full_name},</h2>`,
                  `<p style="margin:0 0 16px;color:#52525b;">Here is your check-in pass for <strong>${attendant.games.events.name}</strong> (${attendant.games.name}).</p>`,
                  `<div style="background:#fafafa;padding:16px;border-radius:8px;text-align:center;margin-bottom:16px;">`,
                  `<img src="${qrDataUrl}" alt="Check-In QR Code" width="200" height="200" style="display:block;margin:0 auto 12px;" />`,
                  `<p style="margin:0;font-family:monospace;font-size:14px;font-weight:600;color:#18181b;">Ticket: ${attendant.ticket_code}</p>`,
                  `<p style="margin:4px 0 0;font-family:monospace;font-size:11px;color:#71717a;">${attendant.qr_code_payload}</p>`,
                  `</div>`,
                  `</div>`,
               ].join(''),
            });
         }

         const updateResult = await supabase
            .from('lucky_draw_attendants')
            .update({
               email_status: 'SENT',
               email_sent_at: nowIso,
            })
            .eq('id', attendant.id);

         if (updateResult.error) {
            failedCount += 1;
         } else {
            sentCount += 1;
         }
      } catch {
         await supabase
            .from('lucky_draw_attendants')
            .update({
               email_status: 'FAILED',
            })
            .eq('id', attendant.id);
         failedCount += 1;
      }
   }

   const firstRecord = attendants[0];
   await supabase.from('logs').insert({
      account_id: callerId,
      event_id: firstRecord?.games.event_id ?? null,
      game_id: firstRecord?.game_id ?? null,
      action_type: 'EMAIL_BATCH_SEND',
      target_entity: 'lucky_draw_attendants',
      target_id: firstRecord?.game_id ?? null,
      metadata: {
         requested_count: request.attendantIds.length,
         sent_count: sentCount,
         skipped_count: skippedCount,
         failed_count: failedCount,
      },
   });

   revalidatePath(ROUTE.ADMIN.LUCKY_DRAW.ATTENDANT.SEARCH);

   return {
      sentCount,
      skippedCount,
      failedCount,
   };
};

