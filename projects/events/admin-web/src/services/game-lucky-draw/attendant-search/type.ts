export interface Request {
   gameId: string;
   search?: string;
   filter?: Filter;
   page?: number;
   pageSize?: number;
}

export interface Response {
   attendants: Attendant[];
   totalCount: number;
}

export type Attendant = AdminWeb.Database.GameLuckyDrawAttendant;
export type Filter = AdminWeb.Features.GameLuckyDraw.Attendant.Filter;

export type Service = (request: Request) => AdminWeb.Utilities.Trycatch.ResultAsync<Response>;
