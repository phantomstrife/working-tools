import type { Database } from '@/adapters/supabase/type';

export type EventRow = Database['public']['Tables']['events']['Row'];

export interface Request {
   id: string;
}

export interface Response {
   event: EventRow;
}

export type GetById = (request: Request) => Promise<Response>;

