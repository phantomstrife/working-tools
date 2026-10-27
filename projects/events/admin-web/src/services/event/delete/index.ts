'use server';

import { getServerClient } from '@admin-web/adapters/supabase/server';
import { useServicesUserRead } from '@admin-web/services/user/read/server';
import { trycatchAsync } from '@admin-web/utilities/trycatch';

import type * as Types from './type';

export const useServicesEventDelete: Types.Service = async (request) => {
   return trycatchAsync(async () => {
      const serviceUserRead = await useServicesUserRead();

      if (serviceUserRead.error) {
         throw new Error(serviceUserRead.message);
      }

      const { role, companyId: userCompanyId } = serviceUserRead.data;

      if (role !== 'SUPER_ADMIN' && role !== 'ADMIN') {
         throw new Error('services.user.access_denied');
      }

      const supabase = await getServerClient();

      const existingEvent = await supabase
         .from('events')
         .select('id, company_id')
         .eq('id', request.id)
         .single();

      if (existingEvent.error || !existingEvent.data) {
         throw new Error('services.event.not_found');
      }

      if (role === 'ADMIN' && existingEvent.data.company_id !== userCompanyId) {
         throw new Error('services.user.access_denied');
      }

      const deleted = await supabase.from('events').delete().eq('id', request.id);

      if (deleted.error) {
         throw new Error(deleted.error.message || 'services.event.delete_failed');
      }

      return {
         deletedId: request.id,
      };
   });
};

