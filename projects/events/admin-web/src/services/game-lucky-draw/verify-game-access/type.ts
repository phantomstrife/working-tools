import type { SupabaseClient } from '@supabase/supabase-js';

export interface Request {
   gameId: string;
}

export interface Response {
   supabase: SupabaseClient<AdminWeb.Database.Instance>;
   userId: string;
   role: AdminWeb.Database.Account_Role;
   companyId: string;
   game: {
      id: string;
      name: string;
      event_id: string;
   };
   event: {
      id: string;
      name: string;
      company_id: string;
      location_name: string | null;
      start_time: string | null;
   };
}

export type Service = (request: Request) => AdminWeb.Utilities.Trycatch.ResultAsync<Response>;

