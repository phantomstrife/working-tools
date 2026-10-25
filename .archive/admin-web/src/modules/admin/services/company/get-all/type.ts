import type { Database } from '@/adapters/supabase/type';

export type CompanyRow = Database['public']['Tables']['companies']['Row'];
export type CompanyStatus = Database['public']['Enums']['company_status'];
export type CompanySortField = 'name' | 'created_at' | 'updated_at' | 'status';
export type SortOrder = 'asc' | 'desc';

export interface Request {
   search?: string;
   status?: CompanyStatus | 'ALL';
   page?: number;
   limit?: number;
   sortBy?: CompanySortField;
   sortOrder?: SortOrder;
}

export interface Response {
   items: CompanyRow[];
   total: number;
   page: number;
   limit: number;
}

export type GetAll = (request?: Request) => Promise<Response>;

