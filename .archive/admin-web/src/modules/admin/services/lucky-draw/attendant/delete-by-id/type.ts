import type { Database } from '@/adapters/supabase/type';

export type AccountRole = Database['public']['Enums']['account_role'];

export type Request = {
   id: string;
};

export type Response = {
   success: boolean;
};

export type DeleteById = (request: Request) => Promise<Response>;

