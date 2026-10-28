export type Attendant = AdminWeb.Features.GameLuckyDraw.CheckIn.Attendant;

export interface Request {
   gameId: string;
   keyword: string;
}

export type Response = Attendant[];

export type Service = (request: Request) => AdminWeb.Utilities.Trycatch.ResultAsync<Response>;

