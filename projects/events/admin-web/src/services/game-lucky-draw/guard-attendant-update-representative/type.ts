export type Attendant = AdminWeb.Features.GameLuckyDraw.CheckIn.Attendant;

export interface Request {
   gameId: string;
   attendantId: string;
   representative: string | null;
   representativePhone: string | null;
}

export type Response = Attendant;

export type Service = (request: Request) => AdminWeb.Utilities.Trycatch.ResultAsync<Response>;
