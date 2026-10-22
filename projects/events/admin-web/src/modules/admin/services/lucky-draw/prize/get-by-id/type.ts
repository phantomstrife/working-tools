import type { Database } from '@/adapters/supabase/type';

export type Prize = Database['public']['Tables']['lucky_draw_prizes']['Row'];
export type AccountRole = Database['public']['Enums']['account_role'];

export type Request = {
   id: string;
};

export type Response = Prize;

export type GetById = (request: Request) => Promise<Response>;

