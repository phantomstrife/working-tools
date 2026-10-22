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

   let query = supabase.from('companies').select('*', { count: 'exact' });

   const trimmedSearch = request.search?.trim();
   if (trimmedSearch) {
      query = query.or(
         `name.ilike.%${trimmedSearch}%,tax_code.ilike.%${trimmedSearch}%,contact_person.ilike.%${trimmedSearch}%,contact_email.ilike.%${trimmedSearch}%`,
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

