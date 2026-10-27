export type Attendant = ClientApp.Features.GameLuckyDraw.CheckIn.Attendant;

export interface Request {
   gameId: string;
   keyword: string;
}

export type Response = Attendant[];

export type Service = (request: Request) => ClientApp.Utilities.Trycatch.ResultAsync<Response>;
