export interface Request {
   gameId: string;
}

export interface Response {
   csvContent: string;
   fileName: string;
   totalCount: number;
}

export interface AttendantExportRow {
   id: string;
   ticket_code: string;
   salutation: string | null;
   full_name: string;
   email: string | null;
   phone: string | null;
   citizen_id: string | null;
   company_name: string | null;
   department: string | null;
   sale_in_charge: string | null;
   accommodation: boolean | null;
   representative_salutation: string | null;
   representative: string | null;
   representative_phone: string | null;
   email_status: AdminWeb.Database.Email_Status | null;
   email_sent_at: string | null;
   is_checked_in: boolean | null;
   checked_in_at: string | null;
   check_in_method: AdminWeb.Database.Check_In_Method | null;
   is_draw_eligible: boolean;
   has_won: boolean | null;
   created_at: string | null;
}

export type Service = (request: Request) => AdminWeb.Utilities.Trycatch.ResultAsync<Response>;
