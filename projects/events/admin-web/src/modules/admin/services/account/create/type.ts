import type { Database } from '@/adapters/supabase/type';

export type AccountInsert = Database['public']['Tables']['accounts']['Insert'];
export type AccountRow = Database['public']['Tables']['accounts']['Row'];

export type AccountCreateFields = Omit<
   AccountInsert,
   'id' | 'password_hash' | 'created_by' | 'created_at' | 'updated_at'
>;

export interface Request {
   account: AccountCreateFields;
   password: string;
}

export interface Response {
   account: AccountRow;
}

export type Create = (request: Request) => Promise<Response>;
