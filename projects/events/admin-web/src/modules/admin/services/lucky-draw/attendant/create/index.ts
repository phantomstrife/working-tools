'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';

import { getServerClient } from '@/adapters/supabase/server';
import { ROUTE } from '@/constants';

import type * as Types from './type';

export const create: Types.Create = async (request) => {
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
      throw new Error('Only Super Admins and Admins can create attendants.');
   }

   const gameResult = await supabase
      .from('games')
      .select('id, game_type, is_dev_only, events!inner(company_id)')
      .eq('id', request.attendant.game_id)
      .single();

   if (gameResult.error || !gameResult.data) {
      throw new Error('Target game not found.');
   }

   if (caller.role === 'ADMIN') {
      if (!caller.company_id || gameResult.data.events.company_id !== caller.company_id) {
         throw new Error('Admins can only create attendants for games within their own company.');
      }
      if (gameResult.data.is_dev_only) {
         throw new Error('Cannot access developer-only game.');
      }
   }

   const sanitizedTicket = request.attendant.ticket_code.trim();
   const qrPayload =
      request.attendant.qr_code_payload?.trim() ||
      `LD-${request.attendant.game_id.slice(0, 8).toUpperCase()}-${sanitizedTicket.toUpperCase()}-${randomUUID().slice(0, 8).toUpperCase()}`;

   const payload: Types.AttendantInsert = {
      ...request.attendant,
      ticket_code: sanitizedTicket,
      qr_code_payload: qrPayload,
   };

   const result = await supabase.from('lucky_draw_attendants').insert(payload).select('*').single();

   if (result.error) {
      throw new Error(result.error.message);
   }

   revalidatePath(ROUTE.ADMIN.LUCKY_DRAW.ATTENDANT.SEARCH);

   return result.data;
};

