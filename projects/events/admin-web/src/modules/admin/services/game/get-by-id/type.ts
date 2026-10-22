import type { Database } from '@/adapters/supabase/type';

export type GameRow = Database['public']['Tables']['games']['Row'];

export interface Request {
   id: string;
}

export interface Response {
   game: GameRow;
   assignedAccountIds: string[];
}

export type GetById = (request: Request) => Promise<Response>;

