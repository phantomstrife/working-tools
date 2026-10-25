'use server';

import { revalidatePath } from 'next/cache';

import { ROUTE } from '@/constants';
import { getServerClient } from '@/adapters/supabase/server';

import type * as Types from './type';

export const create: Types.Create = async (request) => {
   const supabase = await getServerClient();
   const authResult = await supabase.auth.getUser();

   if (!authResult.data.user) {
      throw new Error('You must be signed in to create games.');
   }

   const callerProfile = await supabase
      .from('accounts')
      .select('role, company_id')
      .eq('id', authResult.data.user.id)
      .single();

   if (!callerProfile.data) {
      throw new Error('Caller account profile not found.');
   }

   let payload: Types.GameInsert = { ...request.game };

   if (callerProfile.data.role === 'ADMIN') {
      payload = {
         ...payload,
         is_dev_only: false,
      };
   }

   const result = await supabase.from('games').insert(payload).select('*').single();

   if (result.error || !result.data) {
      throw new Error(result.error?.message ?? 'Failed to create game.');
   }

   const assignedIds = request.assignedAccountIds ?? [];
   if (assignedIds.length > 0) {
      const assignmentRows = assignedIds.map((accountId) => ({
         game_id: result.data.id,
         event_id: result.data.event_id,
         account_id: accountId,
      }));

      const assignResult = await supabase.from('game_accounts').insert(assignmentRows);
      if (assignResult.error) {
         throw new Error(assignResult.error.message);
      }
   }

   revalidatePath(ROUTE.ADMIN.GAME.SEARCH);

   return {
      game: result.data,
   };
};

