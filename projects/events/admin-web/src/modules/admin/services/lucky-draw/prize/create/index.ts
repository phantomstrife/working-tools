'use server';

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
      throw new Error('Only Super Admins and Admins can create prizes.');
   }

   const gameResult = await supabase
      .from('games')
      .select('id, game_type, is_dev_only, events!inner(company_id)')
      .eq('id', request.prize.game_id)
      .single();

   if (gameResult.error || !gameResult.data) {
      throw new Error('Target game not found.');
   }

   if (gameResult.data.game_type !== 'LUCKY_DRAW') {
      throw new Error('Target game is not a Lucky Draw game.');
   }

   if (caller.role === 'ADMIN') {
      if (!caller.company_id || gameResult.data.events.company_id !== caller.company_id) {
         throw new Error('Admins can only create prizes for games within their own company.');
      }
      if (gameResult.data.is_dev_only) {
         throw new Error('Cannot access developer-only game.');
      }
   }

   const totalQuantity = Math.max(1, Math.floor(request.prize.total_quantity));
   const remainingQuantity = Math.min(
      totalQuantity,
      Math.max(0, Math.floor(request.prize.remaining_quantity ?? totalQuantity)),
   );

   const payload: Types.PrizeInsert = {
      ...request.prize,
      total_quantity: totalQuantity,
      remaining_quantity: remainingQuantity,
   };

   const result = await supabase.from('lucky_draw_prizes').insert(payload).select('*').single();

   if (result.error) {
      throw new Error(result.error.message);
   }

   revalidatePath(ROUTE.ADMIN.LUCKY_DRAW.PRIZE.SEARCH);

   return result.data;
};

