import type { Database } from '@/adapters/supabase/type';

export type EventUpdate = Database['public']['Tables']['events']['Update'];

export interface Request {
   id: string;
   event: Omit<EventUpdate, 'id'>;
}

export type Update = (request: Request) => Promise<void>;

