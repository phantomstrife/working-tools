import type { SupabaseClient } from '@supabase/supabase-js';

export type Get_Server_Client = (proxyResponse?: Proxy_Response) => Promise<SupabaseClient<Database>>;
export type Get_Admin_Client = () => SupabaseClient<Database>;
export type Get_Browser_Client = () => SupabaseClient<Database>;
