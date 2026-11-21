export type Check_In_Method = AdminWeb.Database.Check_In_Method;
export type Account_Role = AdminWeb.Database.Account_Role;
export type Attendant = AdminWeb.Features.GameLuckyDraw.CheckIn.Attendant;
export type Action = 'LOOKUP' | 'CONFIRM';
export type Status = AdminWeb.Features.GameLuckyDraw.CheckIn.Status;

export interface Request {
   accessToken: string;
   gameId: string;
   method: Check_In_Method;
   action?: Action;
   qrCodePayload?: string;
   attendantId?: string;
   searchQuery?: string;
   representativeSalutation?: AdminWeb.Features.GameLuckyDraw.Attendant.Salutation | null;
   representative?: string | null;
   representativePhone?: string | null;
}

export interface Response {
   status: Status;
   attendant: Attendant;
}

export type Service = (request: Request) => AdminWeb.Utilities.Trycatch.ResultAsync<Response>;
