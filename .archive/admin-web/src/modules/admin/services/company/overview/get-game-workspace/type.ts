import type { Database } from '@/adapters/supabase/type';

export type PrizeRow = Database['public']['Tables']['lucky_draw_prizes']['Row'];
export type AttendantRow = Database['public']['Tables']['lucky_draw_attendants']['Row'];
export type AccountRole = Database['public']['Enums']['account_role'];

export type AttendantFilterOption =
   | 'ALL'
   | 'CHECKED_IN'
   | 'NOT_CHECKED_IN'
   | 'WINNER'
   | 'NOT_WINNER'
   | 'EMAIL_SENT'
   | 'EMAIL_NOT_SENT'
   | 'EMAIL_FAILED';

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
   staff: AssignedStaffMember[];
};

export type GetGameWorkspace = (request: Request) => Promise<Response>;

export type GetPaginatedAttendantsOptions = {
   search?: string;
   filter?: AttendantFilterOption;
};

export type PaginatedAttendantsResponse = {
   attendants: AttendantRow[];
   totalCount: number;
   totalPages: number;
};

export type GetPaginatedAttendants = (
   gameId: string,
   page: number,
   pageSize: number,
   options?: GetPaginatedAttendantsOptions,
) => Promise<PaginatedAttendantsResponse>;
