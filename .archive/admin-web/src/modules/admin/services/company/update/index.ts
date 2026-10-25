'use server';

import { revalidatePath } from 'next/cache';

import { getServerClient } from '@/adapters/supabase/server';
import { ROUTE } from '@/constants';

import type * as Types from './type';

export const update: Types.Update = async (request) => {
   const supabase = await getServerClient();
   const authResult = await supabase.auth.getUser();

   if (!authResult.data.user) {
      throw new Error('You must be signed in to update companies.');
   }

   const callerProfile = await supabase
      .from('accounts')
      .select('role, company_id')
      .eq('id', authResult.data.user.id)
      .single();

   const caller = callerProfile.data;
   if (!caller || (caller.role !== 'SUPER_ADMIN' && caller.role !== 'ADMIN')) {
      throw new Error('Access Denied: Only SUPER_ADMIN or ADMIN can update companies.');
   }

   if (caller.role === 'ADMIN') {
      if (!caller.company_id || caller.company_id !== request.id) {
         throw new Error('Access Denied: Admins can only update their own company profile.');
      }
   }

   const payload: Types.Request['company'] =
      caller.role === 'ADMIN'
         ? {
              name: request.company.name,
              tax_code: request.company.tax_code,
              industry: request.company.industry,
              contact_person: request.company.contact_person,
              contact_email: request.company.contact_email,
              contact_phone: request.company.contact_phone,
              address: request.company.address,
              logo_url: request.company.logo_url,
              updated_at: request.company.updated_at ?? new Date().toISOString(),
           }
         : request.company;

   const result = await supabase.from('companies').update(payload).eq('id', request.id);

   if (result.error) {
      throw new Error(result.error.message);
   }

   revalidatePath(ROUTE.ADMIN.COMPANY.OVERVIEW);
   revalidatePath(ROUTE.ADMIN.COMPANY.UPDATE(request.id));
   revalidatePath(ROUTE.ADMIN.COMPANY.SEARCH);
};
