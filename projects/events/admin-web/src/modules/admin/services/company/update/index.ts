'use server';

import { revalidatePath } from 'next/cache';

import { ROUTE } from '@/constants';
import { getServerClient } from '@/adapters/supabase/server';

import type * as Types from './type';

export const update: Types.Update = async (request) => {
   const supabase = await getServerClient();
   const result = await supabase.from('companies').update(request.company).eq('id', request.id);

   if (result.error) {
      throw new Error(result.error.message);
   }

   revalidatePath(ROUTE.ADMIN.COMPANY.UPDATE(request.id));
   revalidatePath(ROUTE.ADMIN.COMPANY.SEARCH);
};
