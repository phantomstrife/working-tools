export interface Request {
   gameId: string;
}

export interface Response {
   csvContent: string;
   fileName: string;
   totalCount: number;
}

export interface JoinedAccount {
   id: string;
   full_name: string;
   email: string;
}

export interface JoinedPrize {
   id: string;
   name: string;
   tier_order: number;
   description: string | null;
}

export interface JoinedAttendant {
   id: string;
   ticket_code: string;
   full_name: string;
   email: string | null;
   phone: string | null;
   company_name: string | null;
   department: string | null;
   is_checked_in: boolean | null;
   check_in_method: AdminWeb.Database.Check_In_Method | null;
   checked_in_at: string | null;
   checked_in_by: string | null;
   checked_in_account?: JoinedAccount | JoinedAccount[] | null;
}

export interface WinnerQueryRow {
   id: string;
   won_at: string | null;
   drawn_by: string | null;
   prize: JoinedPrize | JoinedPrize[] | null;
   attendant: JoinedAttendant | JoinedAttendant[] | null;
   drawn_by_account?: JoinedAccount | JoinedAccount[] | null;
}

export type Service = (request: Request) => AdminWeb.Utilities.Trycatch.ResultAsync<Response>;

