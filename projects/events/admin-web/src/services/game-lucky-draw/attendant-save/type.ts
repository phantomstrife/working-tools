export interface Request {
   id?: string;
   gameId: string;
   full_name: string;
   ticket_code: string;
   email?: string | null;
   phone?: string | null;
   company_name?: string | null;
   department?: string | null;
}

export interface Response {
   attendant: Attendant;
}

export type Attendant = AdminWeb.Database.GameLuckyDrawAttendant;
export type Service = (request: Request) => AdminWeb.Utilities.Trycatch.ResultAsync<Response>;

