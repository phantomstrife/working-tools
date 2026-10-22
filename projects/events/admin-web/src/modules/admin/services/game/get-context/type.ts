import type { Database } from '@/adapters/supabase/type';

export type AccountRole = Database['public']['Enums']['account_role'];

export interface CallerAccount {
   id: string;
   role: AccountRole;
   company_id: string | null;
   full_name: string;
   email: string;
}

export interface EventOption {
   id: string;
   name: string;
   company_id: string;
}

export interface StaffAccountOption {
   id: string;
   full_name: string;
   email: string;
   role: AccountRole;
   company_id: string | null;
}

export interface Response {
   caller: CallerAccount | null;
   events: EventOption[];
   staffAccounts: StaffAccountOption[];
}

export type GetContext = () => Promise<Response>;

