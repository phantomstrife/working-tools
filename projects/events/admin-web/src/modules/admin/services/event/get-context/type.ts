import type { Database } from '@/adapters/supabase/type';

export type AccountRole = Database['public']['Enums']['account_role'];

export interface CallerAccount {
   id: string;
   role: AccountRole;
   company_id: string | null;
   full_name: string;
   email: string;
}

export interface CompanyOption {
   id: string;
   name: string;
}

export interface Response {
   caller: CallerAccount | null;
   companies: CompanyOption[];
}

export type GetContext = () => Promise<Response>;

