import type { Database } from '@/adapters/supabase/type';

export type CompanyUpdate = Database['public']['Tables']['companies']['Update'];

export interface Request {
   id: string;
   company: Omit<CompanyUpdate, 'id'>;
}

export type Update = (request: Request) => Promise<void>;