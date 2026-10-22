'use server';

import { getServerClient } from '@/adapters/supabase/server';

import type * as Types from './type';

export const getById: Types.GetById = async (request) => {
   const supabase = await getServerClient();
   const result = await supabase.from('companies').select('*').eq('id', request.id).single();

   if (result.error || !result.data) {
      throw new Error(result.error?.message ?? 'Company not found.');
   }

   return {
      company: result.data,
   };
};

