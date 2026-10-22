import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { siteUrl } from '@/lib/url';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(req: Request) {
   const { searchParams } = new URL(req.url);
   const registrationId = searchParams.get('r');

   if (!registrationId || !UUID_RE.test(registrationId)) {
      return NextResponse.json({ error: 'Missing or invalid pass' }, { status: 400 });
   }

   const { data: reg, error } = await supabaseAdmin
      .from('event_registrations')
      .select('id, status, customers(name)')
      .eq('id', registrationId)
      .maybeSingle();

   if (error || !reg) {
      return NextResponse.json({ error: 'Invalid or expired ticket' }, { status: 404 });
   }

   // Only the first scan records the time; re-scanning keeps the original check-in
   if (reg.status !== 'replied_scanned') {
      const { error: updateError } = await supabaseAdmin
         .from('event_registrations')
         .update({ status: 'replied_scanned', scanned_at: new Date().toISOString() })
         .eq('id', reg.id);

      if (updateError) {
         return NextResponse.json({ error: 'Could not check in' }, { status: 500 });
      }
   }

   const customer = Array.isArray(reg.customers) ? reg.customers[0] : reg.customers;
   return NextResponse.redirect(`${siteUrl}/checkin-success?name=${encodeURIComponent(customer?.name ?? '')}`);
}
