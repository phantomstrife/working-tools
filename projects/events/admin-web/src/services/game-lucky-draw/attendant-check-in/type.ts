export type Check_In_Method = AdminWeb.Database.Check_In_Method;
export type Account_Role = AdminWeb.Database.Account_Role;
export type Attendant = AdminWeb.Features.GameLuckyDraw.CheckIn.Attendant;

export interface Request {
   accessToken: string;
   gameId: string;
   method: Check_In_Method;
   qrCodePayload?: string;
   attendantId?: string;
   searchQuery?: string;
}

export interface Response {
   status: 'CHECKED_IN' | 'ALREADY_CHECKED_IN';
   attendant: Attendant;
}

export type Service = (request: Request) => AdminWeb.Utilities.Trycatch.ResultAsync<Response>;

