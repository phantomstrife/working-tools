'use server';

import { revalidatePath } from 'next/cache';

import { ROUTE } from '@/constants';
import { getServerClient } from '@/adapters/supabase/server';

import type * as Types from './type';

export const update: Types.Update = async (request) => {
   const supabase = await getServerClient();
   const authResult = await supabase.auth.getUser();

   if (!authResult.data.user) {
      throw new Error('You must be signed in to update games.');
   }

   const callerProfile = await supabase
      .from('accounts')
      .select('role, company_id')
      .eq('id', authResult.data.user.id)
      .single();

   let payload: Omit<Types.GameUpdate, 'id'> = { ...request.game };

   if (callerProfile.data?.role === 'ADMIN') {
      payload = {
         ...payload,
         is_dev_only: false,
      };
   }

   const result = await supabase.from('games').update(payload).eq('id', request.id).select('id, event_id').single();

   if (result.error || !result.data) {
      throw new Error(result.error?.message ?? 'Failed to update game.');
   }

   if (request.assignedAccountIds !== undefined) {
      const deleteOld = await supabase.from('game_accounts').delete().eq('game_id', request.id);
      if (deleteOld.error) {
         throw new Error(deleteOld.error.message);
      }

      if (request.assignedAccountIds.length > 0) {
         const assignmentRows = request.assignedAccountIds.map((accountId) => ({
            game_id: request.id,
            event_id: result.data.event_id,
            account_id: accountId,
         }));

         const insertNew = await supabase.from('game_accounts').insert(assignmentRows);
         if (insertNew.error) {
            throw new Error(insertNew.error.message);
         }
      }
   }

   revalidatePath(ROUTE.ADMIN.GAME.UPDATE(request.id));
   revalidatePath(ROUTE.ADMIN.GAME.SEARCH);
};

