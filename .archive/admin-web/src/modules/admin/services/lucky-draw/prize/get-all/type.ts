import type { Database } from '@/adapters/supabase/type';

export type Prize = Database['public']['Tables']['lucky_draw_prizes']['Row'];
export type AccountRole = Database['public']['Enums']['account_role'];

export type PrizeWithRelations = Prize & {
   games?: {
      id: string;
      name: string;
      event_id: string;
      is_dev_only: boolean | null;
      events?: {
         id: string;
         name: string;
         company_id: string;
      } | null;
   } | null;
};

export type Request = {
   search?: string;
   gameId?: string | 'ALL';
   stockStatus?: 'ALL' | 'IN_STOCK' | 'DEPLETED';
   sortBy?: 'tier_order' | 'name' | 'total_quantity' | 'remaining_quantity' | 'created_at';
   sortOrder?: 'asc' | 'desc';
   page?: number;
   limit?: number;
};

export type Response = {
   items: PrizeWithRelations[];
   total: number;
   page: number;
   limit: number;
};

export type GetAll = (request?: Request) => Promise<Response>;

