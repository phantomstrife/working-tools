import type { Database } from '@/adapters/supabase/type';

export type Attendant = Database['public']['Tables']['lucky_draw_attendants']['Row'];
export type AttendantInsert = Database['public']['Tables']['lucky_draw_attendants']['Insert'];
export type AccountRole = Database['public']['Enums']['account_role'];

export type Request = {
   attendant: Omit<AttendantInsert, 'qr_code_payload'> & {
      qr_code_payload?: string;
   };
};

export type Response = Attendant;

export type Create = (request: Request) => Promise<Response>;

