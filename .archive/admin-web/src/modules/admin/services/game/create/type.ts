import type { Database } from '@/adapters/supabase/type';

export type GameInsert = Database['public']['Tables']['games']['Insert'];
export type GameRow = Database['public']['Tables']['games']['Row'];

export interface Request {
   game: GameInsert;
   assignedAccountIds?: string[];
}

export interface Response {
   game: GameRow;
}

export type Create = (request: Request) => Promise<Response>;

