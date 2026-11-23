export interface Candidate {
   id: string;
   ticket_code: string;
   salutation: string | null;
   full_name: string;
   representative_salutation: string | null;
   representative: string | null;
   company_name: string | null;
   phone: string | null;
   is_checked_in: boolean | null;
   is_draw_eligible: boolean;
   has_won: boolean | null;
}

export interface Request {
   gameId: string;
}

export interface Response {
   attendants: Candidate[];
}

export type Service = (request: Request) => AdminWeb.Utilities.Trycatch.ResultAsync<Response>;
