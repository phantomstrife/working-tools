import type { Database } from '@/adapters/supabase/type';

export type AccountRow = Database['public']['Tables']['accounts']['Row'];
export type AccountRole = Database['public']['Enums']['account_role'];
export type AccountStatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';
export type AccountSortField = 'full_name' | 'email' | 'role' | 'created_at' | 'updated_at';
export type SortOrder = 'asc' | 'desc';

export interface AccountWithCompany extends AccountRow {
   companies?: {
      id: string;
      name: string;
   } | null;
}

export interface Request {
   search?: string;
   role?: AccountRole | 'ALL';
   status?: AccountStatusFilter;
   companyId?: string | 'ALL';
   page?: number;
   limit?: number;
   sortBy?: AccountSortField;
   sortOrder?: SortOrder;
}

export interface Response {
   items: AccountWithCompany[];
   total: number;
   page: number;
   limit: number;
}

export type GetAll = (request?: Request) => Promise<Response>;

