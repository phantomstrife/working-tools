/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { resend } from '@/lib/resend';
import { siteUrl } from '@/lib/url';

const escapeHtml = (s: string) =>
   s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function POST(req: Request) {
   try {
      // Only logged-in users may send
      const token = req.headers.get('authorization')?.replace('Bearer ', '');
      const { data: auth } = token ? await supabaseAdmin.auth.getUser(token) : { data: { user: null } };
      if (!auth.user) {
         return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const { registrationIds, customBody } = await req.json();

      if (!Array.isArray(registrationIds) || registrationIds.length === 0) {
         return NextResponse.json({ error: 'No customers selected' }, { status: 400 });
      }

      const { data: registrations, error } = await supabaseAdmin
         .from('event_registrations')
         .select('id, ticket_code, status, customers(name, email)')
         .in('id', registrationIds);

      if (error || !registrations?.length) {
         return NextResponse.json({ error: 'Registrations not found' }, { status: 404 });
      }

      let sent = 0;
      const failed: { email: string; reason: string }[] = [];

      for (const reg of registrations) {
         const customer: any = Array.isArray(reg.customers) ? reg.customers[0] : reg.customers;
         if (!customer?.email) continue;

         try {
            const checkInUrl = `${siteUrl}/api/checkin?r=${reg.id}`;
            const qrDataUrl = await QRCode.toDataURL(checkInUrl);
            const base64 = qrDataUrl.split(',')[1];

            // Escape first, then fill the tags (function replacers avoid "$" pitfalls)
            const formattedBody = escapeHtml(customBody ?? '')
               .replace(/{{name}}/g, () => escapeHtml(customer.name))
               .replace(/{{ticket}}/g, () => escapeHtml(reg.ticket_code));

            const htmlContent = `
               <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                  <div style="font-size: 16px; line-height: 1.5; white-space: pre-wrap;">${formattedBody}</div>
                  <div style="margin-top: 24px; padding: 16px; border: 1px solid #e2e8f0; border-radius: 8px; text-align: center; max-width: 300px;">
                     <p style="font-weight: bold; margin-bottom: 8px;">Your Event Check-in Pass</p>
                     <img src="cid:checkin-qr" alt="Check-in QR Code" width="200" height="200" style="margin: 0 auto;" />
                     <p style="font-size: 12px; color: #64748b; margin-top: 8px;">Ticket: ${escapeHtml(reg.ticket_code)}</p>
                  </div>
               </div>
            `;

            // The Resend SDK returns { error } instead of throwing
            const { error: sendError } = await resend.emails.send({
               from: 'Event Team <onboarding@resend.dev>',
               to: customer.email,
               subject: 'Your check-in pass',
               html: htmlContent,
               attachments: [
                  {
                     filename: 'checkin-qr.png',
                     content: base64, // base64 string or Buffer
                     contentId: 'checkin-qr', // must match the cid: in the img src
                  },
               ],
            });

            if (sendError) throw new Error(sendError.message);

            // Never downgrade someone who already checked in
            if (reg.status === 'imported') {
               await supabaseAdmin.from('event_registrations').update({ status: 'email_sent' }).eq('id', reg.id);
            }
            sent++;
         } catch (err) {
            failed.push({ email: customer.email, reason: (err as Error).message });
         }

         await sleep(600); // stay under Resend's 2 requests/second default limit
      }

      return NextResponse.json({ success: failed.length === 0, count: sent, failed });
   } catch (err: unknown) {
      return NextResponse.json({ error: (err as Error).message }, { status: 500 });
   }
}
