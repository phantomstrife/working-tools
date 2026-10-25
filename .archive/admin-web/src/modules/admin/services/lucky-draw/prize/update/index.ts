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
      throw new Error('Only Super Admins and Admins can update prizes.');
   }

   const existingPrize = await supabase
      .from('lucky_draw_prizes')
      .select('*, games!inner(id, is_dev_only, events!inner(company_id))')
      .eq('id', request.id)
      .single();

   if (existingPrize.error || !existingPrize.data) {
      throw new Error('Prize not found.');
   }

   if (caller.role === 'ADMIN') {
      if (!caller.company_id || existingPrize.data.games.events.company_id !== caller.company_id) {
         throw new Error('Admins can only update prizes within their own company.');
      }
      if (existingPrize.data.games.is_dev_only) {
         throw new Error('Cannot access developer-only game.');
      }
   }

   if (request.prize.game_id && request.prize.game_id !== existingPrize.data.game_id) {
      const targetGame = await supabase
         .from('games')
         .select('id, game_type, is_dev_only, events!inner(company_id)')
         .eq('id', request.prize.game_id)
         .single();

      if (targetGame.error || !targetGame.data) {
         throw new Error('Target game not found.');
      }
      if (caller.role === 'ADMIN') {
         if (!caller.company_id || targetGame.data.events.company_id !== caller.company_id) {
            throw new Error('Cannot reassign prize to another company.');
         }
         if (targetGame.data.is_dev_only) {
            throw new Error('Cannot access developer-only game.');
         }
      }
   }

   const nextTotal = Math.max(
      1,
      Math.floor(request.prize.total_quantity ?? existingPrize.data.total_quantity),
   );
   const nextRemaining = Math.min(
      nextTotal,
      Math.max(0, Math.floor(request.prize.remaining_quantity ?? existingPrize.data.remaining_quantity)),
   );

   const payload: Types.PrizeUpdate = {
      ...request.prize,
      total_quantity: nextTotal,
      remaining_quantity: nextRemaining,
   };

   const result = await supabase
      .from('lucky_draw_prizes')
      .update(payload)
      .eq('id', request.id)
      .select('*')
      .single();

   if (result.error) {
      throw new Error(result.error.message);
   }

   revalidatePath(ROUTE.ADMIN.LUCKY_DRAW.PRIZE.SEARCH);
   revalidatePath(ROUTE.ADMIN.LUCKY_DRAW.PRIZE.UPDATE(request.id));

   return result.data;
};

