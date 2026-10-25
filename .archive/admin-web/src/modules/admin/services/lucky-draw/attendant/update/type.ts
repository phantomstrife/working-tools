import type { Database } from '@/adapters/supabase/type';

export type Attendant = Database['public']['Tables']['lucky_draw_attendants']['Row'];
export type AttendantUpdate = Database['public']['Tables']['lucky_draw_attendants']['Update'];
export type AccountRole = Database['public']['Enums']['account_role'];

export type Request = {
   id: string;
   attendant: AttendantUpdate;
};

export type Response = Attendant;

export type Update = (request: Request) => Promise<Response>;

