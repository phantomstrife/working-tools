import type { Database } from '@/adapters/supabase/type';

export type CompanyInsert = Database['public']['Tables']['companies']['Insert'];
export type CompanyRow = Database['public']['Tables']['companies']['Row'];

export interface Request {
   company: CompanyInsert;
}

export interface Response {
   company: CompanyRow;
}

export type Create = (request: Request) => Promise<Response>;

