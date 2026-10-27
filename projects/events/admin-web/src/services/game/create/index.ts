'use server';

import { getServerClient } from '@admin-web/adapters/supabase/server';
import { useServicesUserRead } from '@admin-web/services/user/read/server';
import { trycatchAsync } from '@admin-web/utilities/trycatch';

import type * as Types from './type';

export const useServicesGameCreate: Types.Service = async (request) => {
   return trycatchAsync(async () => {
      const serviceUserRead = await useServicesUserRead();

      if (serviceUserRead.error) {
         throw new Error(serviceUserRead.message);
      }

      const { role, companyId: userCompanyId } = serviceUserRead.data;

      if (role !== 'SUPER_ADMIN' && role !== 'ADMIN') {
         throw new Error('services.user.access_denied');
      }

      const trimmedName = request.name.trim();

      if (!trimmedName) {
         throw new Error('services.game.missing_name');
      }

      if (!request.eventId) {
         throw new Error('services.game.missing_event');
      }

      const supabase = await getServerClient();

      const eventQuery = await supabase
         .from('events')
         .select('id, company_id')
         .eq('id', request.eventId)
         .single();

      if (eventQuery.error || !eventQuery.data) {
         throw new Error('services.event.not_found');
      }

      if (role === 'ADMIN' && eventQuery.data.company_id !== userCompanyId) {
         throw new Error('services.user.access_denied');
      }

      if (request.id) {
         const existingGame = await supabase
            .from('games')
            .select('id, event_id')
            .eq('id', request.id)
            .single();

         if (existingGame.error || !existingGame.data) {
            throw new Error('services.game_lucky_draw.game_not_found');
         }

         const updatePayload: AdminWeb.Database.GameUpdate = {
            event_id: request.eventId,
            name: trimmedName,
            game_type: request.game_type,
            status: request.status || 'READY',
            description: request.description?.trim() || null,
            updated_at: new Date().toISOString(),
         };

         const updated = await supabase
            .from('games')
            .update(updatePayload)
            .eq('id', request.id)
            .select('*')
            .single();

         if (updated.error || !updated.data) {
            throw new Error(updated.error?.message || 'services.game.save_failed');
         }

         return {
            game: updated.data,
         };
      }

      const insertPayload: AdminWeb.Database.GameInsert = {
         event_id: request.eventId,
         name: trimmedName,
         game_type: request.game_type,
         status: request.status || 'READY',
         description: request.description?.trim() || null,
      };

      const created = await supabase.from('games').insert(insertPayload).select('*').single();

      if (created.error || !created.data) {
         throw new Error(created.error?.message || 'services.game.create_failed');
      }

      return {
         game: created.data,
      };
   });
};
