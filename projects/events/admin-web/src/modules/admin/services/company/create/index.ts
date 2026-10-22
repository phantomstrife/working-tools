'use server';

import { revalidatePath } from 'next/cache';

import { ROUTE } from '@/constants';
import { getServerClient } from '@/adapters/supabase/server';

import type * as Types from './type';

export const create: Types.Create = async (request) => {
   const supabase = await getServerClient();
   const result = await supabase.from('companies').insert(request.company).select('*').single();

   if (result.error || !result.data) {
      throw new Error(result.error?.message ?? 'Failed to create company.');
   }

   revalidatePath(ROUTE.ADMIN.COMPANY.SEARCH);

   return {
      company: result.data,
   };
};

