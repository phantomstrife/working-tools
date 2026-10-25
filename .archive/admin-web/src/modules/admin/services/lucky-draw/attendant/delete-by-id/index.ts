'use server';

import { revalidatePath } from 'next/cache';

import { getServerClient } from '@/adapters/supabase/server';
import { ROUTE } from '@/constants';

import type * as Types from './type';

export const deleteById: Types.DeleteById = async (request) => {
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
      throw new Error('Only Super Admins and Admins can delete attendants.');
   }

   if (caller.role === 'ADMIN') {
      if (!caller.company_id) {
         throw new Error('Admin account is not linked to a company.');
      }
      const targetAttendant = await supabase
         .from('lucky_draw_attendants')
         .select('id, games!inner(is_dev_only, events!inner(company_id))')
         .eq('id', request.id)
         .single();

      if (targetAttendant.error || !targetAttendant.data) {
         throw new Error('Attendant not found.');
      }

      if (targetAttendant.data.games.events.company_id !== caller.company_id) {
         throw new Error('Cannot delete an attendant belonging to another company.');
      }
      if (targetAttendant.data.games.is_dev_only) {
         throw new Error('Cannot delete an attendant in a developer-only game.');
      }
   }

   const result = await supabase.from('lucky_draw_attendants').delete().eq('id', request.id);

   if (result.error) {
      throw new Error(result.error.message);
   }

   revalidatePath(ROUTE.ADMIN.LUCKY_DRAW.ATTENDANT.SEARCH);

   return { success: true };
};

