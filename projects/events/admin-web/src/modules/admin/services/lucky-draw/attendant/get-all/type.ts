import type { Database } from '@/adapters/supabase/type';

export type Attendant = Database['public']['Tables']['lucky_draw_attendants']['Row'];
export type EmailStatus = Database['public']['Enums']['email_status_type'];
export type AccountRole = Database['public']['Enums']['account_role'];

export type AttendantWithRelations = Attendant & {
   games?: {
      id: string;
      name: string;
      event_id: string;
      is_dev_only: boolean | null;
      events?: {
         id: string;
         name: string;
         company_id: string;
      } | null;
   } | null;
};

export type Request = {
   search?: string;
   gameId?: string | 'ALL';
   emailStatus?: EmailStatus | 'ALL';
   checkInFilter?: 'ALL' | 'CHECKED_IN' | 'NOT_CHECKED_IN';
   winnerFilter?: 'ALL' | 'WINNER' | 'NOT_WINNER';
   sortBy?: 'created_at' | 'full_name' | 'ticket_code' | 'email_status' | 'checked_in_at';
   sortOrder?: 'asc' | 'desc';
   page?: number;
   limit?: number;
};

export type Response = {
   items: AttendantWithRelations[];
   total: number;
   page: number;
   limit: number;
};

export type GetAll = (request?: Request) => Promise<Response>;

