export interface Request {
   gameId: string;
}

export interface Response {
   csvContent: string;
   fileName: string;
   totalCount: number;
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
   citizen_id: string | null;
   full_name: string;
   email: string | null;
   phone: string | null;
   company_name: string | null;
   department: string | null;
   sale_in_charge: string | null;
   accommodation: boolean | null;
   representative: string | null;
   representative_phone: string | null;
}

export interface WinnerQueryRow {
   id: string;
   won_at: string | null;
   prize: JoinedPrize | JoinedPrize[] | null;
   attendant: JoinedAttendant | JoinedAttendant[] | null;
}

export type Service = (request: Request) => AdminWeb.Utilities.Trycatch.ResultAsync<Response>;
