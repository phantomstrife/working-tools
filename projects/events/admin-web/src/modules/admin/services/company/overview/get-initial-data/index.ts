'use server';

import { getServerClient } from '@/adapters/supabase/server';

import type * as Types from './type';

export const getInitialData: Types.GetInitialData = async (request = {}) => {
   const supabase = await getServerClient();
   const authResult = await supabase.auth.getUser();

   if (!authResult.data.user) {
      throw new Error('Unauthorized.');
   }

   const profileResult = await supabase
      .from('accounts')
      .select('id, role, company_id, full_name, email')
      .eq('id', authResult.data.user.id)
      .single();

   if (profileResult.error || !profileResult.data) {
      throw new Error('Account profile not found.');
   }

   const caller = profileResult.data;

   let companies: Types.CompanyOption[] = [];
   let targetCompanyId: string | null = null;

   if (caller.role === 'SUPER_ADMIN') {
      const companiesResult = await supabase
         .from('companies')
         .select('id, name, status')
         .order('name', { ascending: true });

      companies = companiesResult.data ?? [];
      targetCompanyId = request.companyId?.trim() || companies[0]?.id || null;
   } else if (caller.role === 'ADMIN') {
      if (!caller.company_id) {
         throw new Error('Admin account is not linked to a company.');
      }
      targetCompanyId = caller.company_id;
   } else {
      throw new Error('Access denied.');
   }

   if (!targetCompanyId) {
      return {
         caller,
         company: null,
         companies,
         events: [],
      };
   }

   const [companyResult, eventsResult] = await Promise.all([
      supabase.from('companies').select('*').eq('id', targetCompanyId).single(),
      supabase
         .from('events')
         .select('*')
         .eq('company_id', targetCompanyId)
         .order('created_at', { ascending: false }),
   ]);

   if (companyResult.error) {
      throw new Error(companyResult.error.message);
   }

   if (eventsResult.error) {
      throw new Error(eventsResult.error.message);
   }

   if (caller.role === 'ADMIN' && companyResult.data) {
      companies = [
         {
            id: companyResult.data.id,
            name: companyResult.data.name,
            status: companyResult.data.status,
         },
      ];
   }

   return {
      caller,
      company: companyResult.data,
      companies,
      events: eventsResult.data ?? [],
   };
};

