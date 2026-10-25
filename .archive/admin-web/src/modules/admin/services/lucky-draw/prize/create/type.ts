import type { Database } from '@/adapters/supabase/type';

export type Prize = Database['public']['Tables']['lucky_draw_prizes']['Row'];
export type PrizeInsert = Database['public']['Tables']['lucky_draw_prizes']['Insert'];
export type AccountRole = Database['public']['Enums']['account_role'];

export type Request = {
   prize: PrizeInsert;
};

export type Response = Prize;

export type Create = (request: Request) => Promise<Response>;

