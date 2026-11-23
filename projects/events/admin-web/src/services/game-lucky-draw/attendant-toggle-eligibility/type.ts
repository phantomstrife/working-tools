export interface Request {
   gameId: string;
   attendantId: string;
   isDrawEligible: boolean;
}

export interface Response {
   attendant: Attendant;
}

export type Attendant = AdminWeb.Database.GameLuckyDrawAttendant;
export type Service = (request: Request) => AdminWeb.Utilities.Trycatch.ResultAsync<Response>;
