import type { Database } from '@/adapters/supabase/type';

export type AttendantInsert = Database['public']['Tables']['lucky_draw_attendants']['Insert'];

export type ImportRow = {
   game_id: string;
   full_name: string;
   ticket_code: string;
   email?: string | null;
   phone?: string | null;
   company_name?: string | null;
   department?: string | null;
};

export type Request = {
   rows: ImportRow[];
};

export type Response = {
   importedCount: number;
};

export type BulkImport = (request: Request) => Promise<Response>;

