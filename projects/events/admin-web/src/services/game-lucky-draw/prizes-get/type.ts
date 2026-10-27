export interface Request {
   id: string;
}

export interface Response {
   prizes: GameLuckyDrawPrize[];
}

export type GameLuckyDrawPrize = AdminWeb.Database.GameLuckyDrawPrize;
export type Service = (request: Request) => AdminWeb.Utilities.Trycatch.ResultAsync<Response>;
