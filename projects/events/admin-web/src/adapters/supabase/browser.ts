import { createBrowserClient } from '@supabase/ssr';

import { SUPABASE } from './constants';

import type * as Types from './type';

const getBrowserClient: Types.Get_Browser_Client = () => {
   return createBrowserClient<Database>(SUPABASE.URL, SUPABASE.ANON_KEY);
};

export const supabase = getBrowserClient();
