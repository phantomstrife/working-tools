'use server';

import { revalidatePath } from 'next/cache';

import { getServerClient } from '@/adapters/supabase/server';
import { ROUTE } from '@/constants';

import type * as Types from './type';

export const assignGameStaff: Types.AssignGameStaff = async (request) => {
   if (request.accountIds.length === 0) {
      return { assignedCount: 0 };
   }

   const supabase = await getServerClient();
   const authResult = await supabase.auth.getUser();

   if (!authResult.data.user) {
      throw new Error('Unauthorized.');
   }

   const profileResult = await supabase
      .from('accounts')
      .select('role, company_id')
      .eq('id', authResult.data.user.id)
      .single();

   if (profileResult.error || !profileResult.data) {
      throw new Error('Unable to verify caller permissions.');
   }

   const caller = profileResult.data;
   if (caller.role !== 'SUPER_ADMIN' && caller.role !== 'ADMIN') {
      throw new Error('Only Super Admins and Admins can assign staff.');
   }

   const gameResult = await supabase
      .from('games')
      .select('id, event_id, is_dev_only, events!inner(company_id)')
      .eq('id', request.gameId)
      .single();

   if (gameResult.error || !gameResult.data) {
      throw new Error('Target game not found.');
   }

   if (caller.role === 'ADMIN') {
      if (!caller.company_id || gameResult.data.events.company_id !== caller.company_id) {
         throw new Error('Access denied: Game does not belong to your company.');
      }
      if (gameResult.data.is_dev_only) {
         throw new Error('Access denied: Cannot access developer-only game.');
      }
   }

   const existingResult = await supabase
      .from('game_accounts')
      .select('account_id')
      .eq('game_id', request.gameId)
      .in('account_id', request.accountIds);

   const existingIds = new Set((existingResult.data ?? []).map((row) => row.account_id));
   const rowsToInsert = request.accountIds
      .filter((accountId) => !existingIds.has(accountId))
      .map((accountId) => ({
         game_id: request.gameId,
         event_id: request.eventId,
         account_id: accountId,
      }));

   if (rowsToInsert.length > 0) {
      const insertResult = await supabase.from('game_accounts').insert(rowsToInsert);
      if (insertResult.error) {
         throw new Error(insertResult.error.message);
      }
   }

   revalidatePath(ROUTE.ADMIN.COMPANY.OVERVIEW);

   return {
      assignedCount: rowsToInsert.length,
   };
};

