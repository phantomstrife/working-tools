import type { Database } from '@/adapters/supabase/type';

export type CompanyRow = Database['public']['Tables']['companies']['Row'];

export interface Request {
   id: string;
}

export interface Response {
   company: CompanyRow;
}

export type GetById = (request: Request) => Promise<Response>;

