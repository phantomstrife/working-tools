'use server';

import { getServerClient } from '@/adapters/supabase/server';

import type * as Types from './type';

export const getContext: Types.GetContext = async () => {
   const supabase = await getServerClient();
   const authResult = await supabase.auth.getUser();

   let caller: Types.CallerAccount | null = null;

   if (authResult.data.user) {
      const profileResult = await supabase
         .from('accounts')
         .select('id, role, company_id, full_name, email')
         .eq('id', authResult.data.user.id)
         .single();

      if (profileResult.data) {
         caller = profileResult.data;
      }
   }

   let companiesQuery = supabase.from('companies').select('id, name').order('name', { ascending: true });

   if (caller?.role === 'ADMIN' && caller.company_id) {
      companiesQuery = companiesQuery.eq('id', caller.company_id);
   }

   const companiesResult = await companiesQuery;

   return {
      caller,
      companies: companiesResult.data ?? [],
   };
};

