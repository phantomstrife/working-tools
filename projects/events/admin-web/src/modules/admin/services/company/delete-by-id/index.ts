'use server';

import { revalidatePath } from 'next/cache';

import { ROUTE } from '@/constants';
import { getServerClient } from '@/adapters/supabase/server';

import type * as Types from './type';

export const deleteById: Types.DeleteById = async (request) => {
   const supabase = await getServerClient();
   const result = await supabase.from('companies').delete().eq('id', request.id);

   if (result.error) {
      throw new Error(result.error.message);
   }

   revalidatePath(ROUTE.ADMIN.COMPANY.SEARCH);
};
