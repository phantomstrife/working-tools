'use client';

import { supabase } from '@admin-web/adapters/supabase/browser';
import { trycatchAsync } from '@admin-web/utilities/trycatch';

import type * as Types from './type';

// Lists every company for the SUPER_ADMIN company switcher (RLS limits other roles to their own scope).
export const useServicesCompanySearch: Types.Service = async () => {
   const result = await trycatchAsync(async () => {
      const companies = await supabase.from('companies').select('id, name').order('name', { ascending: true });

      if (companies.error) {
         throw new Error(companies.error.message);
      }

      return {
         companies: companies.data ?? [],
      };
   });

   return result;
};
