import { Database } from '@/adapters/supabase/type';

type Company = Database['public']['Tables']['companies']['Row'];

interface Request {
   id: string;
   company: Partial<Omit<Company, 'id'>>;
}

export type Update = (request: Request) => Promise<void>;
