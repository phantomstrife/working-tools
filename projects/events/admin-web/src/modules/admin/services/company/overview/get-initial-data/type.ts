import type { Database } from '@/adapters/supabase/type';

export type Company = Database['public']['Tables']['companies']['Row'];
export type EventRow = Database['public']['Tables']['events']['Row'];
export type AccountRole = Database['public']['Enums']['account_role'];

export type CallerAccount = Pick<
   Database['public']['Tables']['accounts']['Row'],
   'id' | 'role' | 'company_id' | 'full_name' | 'email'
>;

export type CompanyOption = Pick<Company, 'id' | 'name' | 'status'>;

export type Request = {
   companyId?: string | null;
};

export type Response = {
   caller: CallerAccount | null;
   company: Company | null;
   companies: CompanyOption[];
   events: EventRow[];
};

export type GetInitialData = (request?: Request) => Promise<Response>;

