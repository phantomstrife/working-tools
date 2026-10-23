import type { Database } from '@/adapters/supabase/type';

export type PrizeRow = Database['public']['Tables']['lucky_draw_prizes']['Row'];
export type AttendantRow = Database['public']['Tables']['lucky_draw_attendants']['Row'];
export type AccountRole = Database['public']['Enums']['account_role'];

export type AssignedStaffMember = {
   assignmentId: string;
   assignedAt: string | null;
   id: string;
   full_name: string;
   email: string;
   username: string | null;
   phone: string | null;
   role: AccountRole;
   is_active: boolean | null;
};

export type Request = {
   gameId: string;
};

export type Response = {
   prizes: PrizeRow[];
   attendants: AttendantRow[];
   staff: AssignedStaffMember[];
};

export type GetGameWorkspace = (request: Request) => Promise<Response>;
