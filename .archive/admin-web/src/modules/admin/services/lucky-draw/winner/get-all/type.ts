import type { Database } from '@/adapters/supabase/type';

export type Winner = Database['public']['Tables']['lucky_draw_winners']['Row'];
export type AccountRole = Database['public']['Enums']['account_role'];

export type WinnerWithRelations = Winner & {
   lucky_draw_prizes?: {
      id: string;
      name: string;
      tier_order: number;
   } | null;
   lucky_draw_attendants?: {
      id: string;
      full_name: string;
      ticket_code: string;
      email: string | null;
      phone: string | null;
      company_name: string | null;
      department: string | null;
   } | null;
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
   accounts?: {
      id: string;
      full_name: string;
      email: string;
   } | null;
};

export type Request = {
   search?: string;
   gameId?: string | 'ALL';
   prizeId?: string | 'ALL';
   sortOrder?: 'asc' | 'desc';
   page?: number;
   limit?: number;
};

export type Response = {
   items: WinnerWithRelations[];
   total: number;
   page: number;
   limit: number;
};

export type GetAll = (request?: Request) => Promise<Response>;

