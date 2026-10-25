import type { Database } from '@/adapters/supabase/type';

export type AccountRow = Database['public']['Tables']['accounts']['Row'];

export interface Request {
   id: string;
}

export interface Response {
   account: AccountRow;
}

export type GetById = (request: Request) => Promise<Response>;

