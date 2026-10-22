import type { Database } from '@/adapters/supabase/type';

export type EventInsert = Database['public']['Tables']['events']['Insert'];
export type EventRow = Database['public']['Tables']['events']['Row'];

export interface Request {
   event: EventInsert;
}

export interface Response {
   event: EventRow;
}

export type Create = (request: Request) => Promise<Response>;

