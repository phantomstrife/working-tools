import type { Database } from '@/adapters/supabase/type';

export type GameUpdate = Database['public']['Tables']['games']['Update'];

export interface Request {
   id: string;
   game: Omit<GameUpdate, 'id'>;
   assignedAccountIds?: string[];
}

export type Update = (request: Request) => Promise<void>;

