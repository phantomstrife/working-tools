import type { Database } from '@/adapters/supabase/type';

export type Prize = Database['public']['Tables']['lucky_draw_prizes']['Row'];
export type PrizeUpdate = Database['public']['Tables']['lucky_draw_prizes']['Update'];
export type AccountRole = Database['public']['Enums']['account_role'];

export type Request = {
   id: string;
   prize: PrizeUpdate;
};

export type Response = Prize;

export type Update = (request: Request) => Promise<Response>;

