'use server';

import { revalidatePath } from 'next/cache';

import { getServerClient } from '@/adapters/supabase/server';
import { ROUTE } from '@/constants';

import type * as Types from './type';

export const update: Types.Update = async (request) => {
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
      throw new Error('Only Super Admins and Admins can update attendants.');
   }

   const existingAttendant = await supabase
      .from('lucky_draw_attendants')
      .select('*, games!inner(id, is_dev_only, events!inner(company_id))')
      .eq('id', request.id)
      .single();

   if (existingAttendant.error || !existingAttendant.data) {
      throw new Error('Attendant not found.');
   }

   if (caller.role === 'ADMIN') {
      if (!caller.company_id || existingAttendant.data.games.events.company_id !== caller.company_id) {
         throw new Error('Admins can only update attendants within their own company.');
      }
      if (existingAttendant.data.games.is_dev_only) {
         throw new Error('Cannot access developer-only game.');
      }
   }

   if (request.attendant.game_id && request.attendant.game_id !== existingAttendant.data.game_id) {
      const targetGame = await supabase
         .from('games')
         .select('id, is_dev_only, events!inner(company_id)')
         .eq('id', request.attendant.game_id)
         .single();

      if (targetGame.error || !targetGame.data) {
         throw new Error('Target game not found.');
      }
      if (caller.role === 'ADMIN') {
         if (!caller.company_id || targetGame.data.events.company_id !== caller.company_id) {
            throw new Error('Cannot reassign attendant to another company.');
         }
         if (targetGame.data.is_dev_only) {
            throw new Error('Cannot access developer-only game.');
         }
      }
   }

   const result = await supabase
      .from('lucky_draw_attendants')
      .update(request.attendant)
      .eq('id', request.id)
      .select('*')
      .single();

   if (result.error) {
      throw new Error(result.error.message);
   }

   revalidatePath(ROUTE.ADMIN.LUCKY_DRAW.ATTENDANT.SEARCH);
   revalidatePath(ROUTE.ADMIN.LUCKY_DRAW.ATTENDANT.UPDATE(request.id));

   return result.data;
};

