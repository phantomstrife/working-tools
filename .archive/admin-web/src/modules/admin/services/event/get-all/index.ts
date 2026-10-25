'use server';

import { getServerClient } from '@/adapters/supabase/server';

import type * as Types from './type';

export const getAll: Types.GetAll = async (request = {}) => {
   const supabase = await getServerClient();

   const page = Math.max(1, request.page ?? 1);
   const limit = Math.max(1, request.limit ?? 20);
   const sortBy = request.sortBy ?? 'created_at';
   const sortOrder = request.sortOrder ?? 'desc';
   const from = (page - 1) * limit;
   const to = from + limit - 1;

   const authResult = await supabase.auth.getUser();
   let callerRole: Types.AccountRole | null = null;
   let callerCompanyId: string | null = null;

   if (authResult.data.user) {
      const callerProfile = await supabase
         .from('accounts')
         .select('role, company_id')
         .eq('id', authResult.data.user.id)
         .single();

      if (callerProfile.data) {
         callerRole = callerProfile.data.role;
         callerCompanyId = callerProfile.data.company_id;
      }
   }

   let query = supabase.from('events').select('*, companies(id, name)', { count: 'exact' });

   if (callerRole === 'ADMIN') {
      if (!callerCompanyId) {
         throw new Error('Admin account is not linked to a company.');
      }
      query = query.eq('company_id', callerCompanyId);
   } else if (request.companyId && request.companyId !== 'ALL') {
      query = query.eq('company_id', request.companyId);
   }

   const trimmedSearch = request.search?.trim();
   if (trimmedSearch) {
      query = query.or(
         `name.ilike.%${trimmedSearch}%,slug.ilike.%${trimmedSearch}%,location_name.ilike.%${trimmedSearch}%,location_address.ilike.%${trimmedSearch}%`,
      );
   }

   if (request.status && request.status !== 'ALL') {
      query = query.eq('status', request.status);
   }

   const result = await query.order(sortBy, { ascending: sortOrder === 'asc' }).range(from, to);

   if (result.error) {
      throw new Error(result.error.message);
   }

   return {
      items: result.data ?? [],
      total: result.count ?? 0,
      page,
      limit,
   };
};

