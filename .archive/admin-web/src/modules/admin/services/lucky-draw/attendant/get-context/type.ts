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

export type Response = {
   caller: CallerAccount | null;
   games: GameOption[];
};

export type GetContext = () => Promise<Response>;

