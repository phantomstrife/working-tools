'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';

import { getServerClient } from '@/adapters/supabase/server';
import { ROUTE } from '@/constants';

import type * as Types from './type';

export const bulkImport: Types.BulkImport = async (request) => {
   if (request.rows.length === 0) {
      return { importedCount: 0 };
   }

   const supabase = await getServerClient();

   const authResult = await supabase.auth.getUser();
   if (!authResult.data.user) {
      throw new Error('Unauthorized.');
   }

   const callerProfile = await supabase
      .from('accounts')
      .select('role, company_id')
      .eq('id', authResult.data.user.id)
      .single();

   if (callerProfile.error || !callerProfile.data) {
      throw new Error('Unable to verify caller permissions.');
   }

   const caller = callerProfile.data;
   if (caller.role !== 'SUPER_ADMIN' && caller.role !== 'ADMIN') {
      throw new Error('Only Super Admins and Admins can import attendants.');
   }

   const distinctGameIds = Array.from(new Set(request.rows.map((row) => row.game_id)));
   const gamesResult = await supabase
      .from('games')
      .select('id, is_dev_only, events!inner(company_id)')
      .in('id', distinctGameIds);

   if (gamesResult.error || !gamesResult.data || gamesResult.data.length !== distinctGameIds.length) {
      throw new Error('One or more target games were not found.');
   }

   if (caller.role === 'ADMIN') {
      for (const game of gamesResult.data) {
         if (!caller.company_id || game.events.company_id !== caller.company_id || game.is_dev_only) {
            throw new Error('Admins can only import attendants into games within their own company.');
         }
      }
   }

   const payloads: Types.AttendantInsert[] = request.rows.map((row) => {
      const sanitizedTicket = row.ticket_code.trim();
      const qrPayload = `LD-${row.game_id.slice(0, 8).toUpperCase()}-${sanitizedTicket.toUpperCase()}-${randomUUID().slice(0, 8).toUpperCase()}`;

      return {
         game_id: row.game_id,
         full_name: row.full_name.trim(),
         ticket_code: sanitizedTicket,
         email: row.email?.trim() || null,
         phone: row.phone?.trim() || null,
         company_name: row.company_name?.trim() || null,
         department: row.department?.trim() || null,
         qr_code_payload: qrPayload,
         email_status: 'NOT_SENT',
         is_checked_in: false,
         has_won: false,
      };
   });

   const result = await supabase
      .from('lucky_draw_attendants')
      .upsert(payloads, { onConflict: 'game_id,ticket_code' })
      .select('id');

   if (result.error) {
      throw new Error(result.error.message);
   }

   revalidatePath(ROUTE.ADMIN.LUCKY_DRAW.ATTENDANT.SEARCH);

   return {
      importedCount: result.data?.length ?? payloads.length,
   };
};

