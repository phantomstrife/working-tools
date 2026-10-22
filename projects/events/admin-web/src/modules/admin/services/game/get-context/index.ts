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

   let eventsQuery = supabase.from('events').select('id, name, company_id').order('name', { ascending: true });
   let staffQuery = supabase
      .from('accounts')
      .select('id, full_name, email, role, company_id')
      .in('role', ['FIELD_STAFF', 'GUARD'])
      .eq('is_active', true)
      .order('full_name', { ascending: true });

   if (caller?.role === 'ADMIN' && caller.company_id) {
      eventsQuery = eventsQuery.eq('company_id', caller.company_id);
      staffQuery = staffQuery.eq('company_id', caller.company_id);
   }

   const [eventsResult, staffResult] = await Promise.all([eventsQuery, staffQuery]);

   return {
      caller,
      events: eventsResult.data ?? [],
      staffAccounts: staffResult.data ?? [],
   };
};

