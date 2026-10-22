'use server';

import { revalidatePath } from 'next/cache';

import { ROUTE } from '@/constants';
import { getServerClient } from '@/adapters/supabase/server';

import type * as Types from './type';

export const update: Types.Update = async (request) => {
   const supabase = await getServerClient();
   const companies = await supabase.from('companies').update(request.company).eq('id', request.id);

   console.log(companies);

   if (companies.error) {
      throw new Error(companies.error.message);
   }

   revalidatePath(ROUTE.ADMIN.COMPANY.GET(request.id));
   revalidatePath(ROUTE.ADMIN.COMPANY.GET_ALL);
};
