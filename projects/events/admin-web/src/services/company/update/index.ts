'use client';

import { supabase } from '@admin-web/adapters/supabase/browser';
import { useServicesUserRead } from '@admin-web/services/user/read/browser';
import { trycatchAsync } from '@admin-web/utilities/trycatch';

import type * as Types from './type';

export const useServicesCompanyUpdate: Types.Service = async (request) => {
   const result = trycatchAsync(async () => {
      const serviceUserRead = await useServicesUserRead();

      if (serviceUserRead.error) {
         throw new Error(serviceUserRead.message);
      }

      const role = serviceUserRead.data.role;
      const compamnyId = serviceUserRead.data.companyId;

      if (role !== 'SUPER_ADMIN' && role !== 'ADMIN') {
         throw new Error('services.user.access_denied');
      }

      if (role === 'ADMIN' && compamnyId !== request.id) {
         throw new Error('services.user.access_denied');
      }

      const company = await supabase.from('companies').update(request).eq('id', request.id).select().single();

      if (company.error) {
         throw new Error(company.error.message);
      }

      return {
         company: company.data,
      };
   });

   return result;
};
