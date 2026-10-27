export interface Request {
   gameId: string;
   page?: number;
   pageSize?: number;
   search?: string;
   filter?: Filter;
}

export interface Response {
   prizes: Prize[];
   totalCount: number;
}

export type Prize = AdminWeb.Database.GameLuckyDrawPrize;
export type Filter = AdminWeb.Features.GameLuckyDraw.Prize.Filter;
export type Service = (request: Request) => AdminWeb.Utilities.Trycatch.ResultAsync<Response>;

