import type { Database } from '@/adapters/supabase/type';

export type EventRow = Database['public']['Tables']['events']['Row'];
export type EventStatus = Database['public']['Enums']['event_status'];
export type AccountRole = Database['public']['Enums']['account_role'];
export type EventSortField = 'name' | 'start_time' | 'created_at' | 'updated_at' | 'status';
export type SortOrder = 'asc' | 'desc';

export interface EventWithCompany extends EventRow {
   companies?: {
      id: string;
      name: string;
   } | null;
}

export interface Request {
   search?: string;
   status?: EventStatus | 'ALL';
   companyId?: string | 'ALL';
   page?: number;
   limit?: number;
   sortBy?: EventSortField;
   sortOrder?: SortOrder;
}

export interface Response {
   items: EventWithCompany[];
   total: number;
   page: number;
   limit: number;
}

export type GetAll = (request?: Request) => Promise<Response>;

