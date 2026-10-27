import type { SupabaseClient, SupportedStorage } from '@supabase/supabase-js';

export type Database = ClientApp.Database.Instance;

export type Get_Client = () => SupabaseClient<Database>;
export type Secure_Storage = SupportedStorage;
