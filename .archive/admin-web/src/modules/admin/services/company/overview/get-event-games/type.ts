import type { Database } from '@/adapters/supabase/type';

export type GameRow = Database['public']['Tables']['games']['Row'];

export type Request = {
   eventId: string;
};

export type Response = {
   games: GameRow[];
};

export type GetEventGames = (request: Request) => Promise<Response>;

