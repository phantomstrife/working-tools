'use server';

import { revalidatePath } from 'next/cache';

import { ROUTE } from '@/constants';
import { getServerClient } from '@/adapters/supabase/server';

import type * as Types from './type';

export const deleteById: Types.DeleteById = async (request) => {
   const supabase = await getServerClient();
   const companies = await supabase.from('companies').delete().eq('id', request.id);

   if (companies.error) {
      throw new Error(companies.error.message);
   }

   revalidatePath(ROUTE.ADMIN.COMPANY.GET(request.id));
   revalidatePath(ROUTE.ADMIN.COMPANY.GET_ALL);
};
