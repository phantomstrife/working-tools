export interface Request {
   id?: string;
   gameId: string;
   salutation?: AdminWeb.Features.GameLuckyDraw.Attendant.Salutation | null;
   full_name: string;
   citizen_id?: string | null;
   ticket_code: string;
   email?: string | null;
   phone?: string | null;
   company_name?: string | null;
   department?: string | null;
   representative_salutation?: AdminWeb.Features.GameLuckyDraw.Attendant.Salutation | null;
   representative?: string | null;
   representative_phone?: string | null;
   sale_in_charge?: string | null;
   accommodation?: boolean | null;
   is_checked_in?: boolean | null;
   is_draw_eligible?: boolean | null;
}

export interface Response {
   attendant: Attendant;
}

export type Attendant = AdminWeb.Database.GameLuckyDrawAttendant;
export type Service = (request: Request) => AdminWeb.Utilities.Trycatch.ResultAsync<Response>;
