'use server';

import { getServerClient } from '@/adapters/supabase/server';

import type * as Types from './type';

export const logExport: Types.LogExport = async (request) => {
   const supabase = await getServerClient();

   const authResult = await supabase.auth.getUser();
   if (!authResult.data.user) {
      return { success: false };
   }

   let eventId: string | null = null;
   const validGameId = request.gameId && request.gameId !== 'ALL' ? request.gameId : null;

   if (validGameId) {
      const gameRow = await supabase.from('games').select('event_id').eq('id', validGameId).single();
      if (gameRow.data) {
         eventId = gameRow.data.event_id;
      }
   }

   await supabase.from('logs').insert({
      account_id: authResult.data.user.id,
      event_id: eventId,
      game_id: validGameId,
      action_type: 'REPORT_EXPORT',
      target_entity: 'lucky_draw_winners',
      target_id: validGameId,
      metadata: {
         exported_count: request.exportedCount,
      },
   });

   return { success: true };
};

