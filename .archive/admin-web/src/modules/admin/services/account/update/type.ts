import type { Database } from '@/adapters/supabase/type';

export type AccountUpdate = Database['public']['Tables']['accounts']['Update'];

export type AccountUpdateFields = Omit<AccountUpdate, 'id' | 'password_hash'>;

export interface Request {
   id: string;
   account: AccountUpdateFields;
   password?: string;
}

export type Update = (request: Request) => Promise<void>;
