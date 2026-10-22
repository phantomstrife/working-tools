import type { Database } from '@/adapters/supabase/type';

export type AccountRole = Database['public']['Enums']['account_role'];

export type CallerAccount = Pick<
   Database['public']['Tables']['accounts']['Row'],
   'id' | 'role' | 'company_id' | 'full_name' | 'email'
>;

export type GameOption = {
   id: string;
   name: string;
   event_id: string;
   events: {
      id: string;
      name: string;
      company_id: string;
   } | null;
};

export type PrizeOption = {
   id: string;
   game_id: string;
   name: string;
   tier_order: number;
};

export type Response = {
   caller: CallerAccount | null;
   games: GameOption[];
   prizes: PrizeOption[];
};

export type GetContext = () => Promise<Response>;

