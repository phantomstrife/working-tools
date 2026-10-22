import type { Database } from '@/adapters/supabase/type';

export type Attendant = Database['public']['Tables']['lucky_draw_attendants']['Row'];
export type AccountRole = Database['public']['Enums']['account_role'];

export type Request = {
   id: string;
};

export type Response = Attendant;

export type GetById = (request: Request) => Promise<Response>;

