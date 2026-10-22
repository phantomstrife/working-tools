import type { Database } from '@/adapters/supabase/type';

export type GameRow = Database['public']['Tables']['games']['Row'];
export type GameStatus = Database['public']['Enums']['game_status'];
export type GameType = Database['public']['Enums']['game_type'];
export type AccountRole = Database['public']['Enums']['account_role'];
export type GameSortField = 'name' | 'created_at' | 'updated_at' | 'status';
export type SortOrder = 'asc' | 'desc';

export interface GameWithEvent extends GameRow {
   events?: {
      id: string;
      name: string;
      company_id: string;
   } | null;
   game_accounts?: Array<{
      account_id: string;
   }>;
}

export interface Request {
   search?: string;
   status?: GameStatus | 'ALL';
   gameType?: GameType | 'ALL';
   eventId?: string | 'ALL';
   page?: number;
   limit?: number;
   sortBy?: GameSortField;
   sortOrder?: SortOrder;
}

export interface Response {
   items: GameWithEvent[];
   total: number;
   page: number;
   limit: number;
}

export type GetAll = (request?: Request) => Promise<Response>;

