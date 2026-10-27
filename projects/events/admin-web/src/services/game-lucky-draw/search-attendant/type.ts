export type Filter = '' | 'CHECKED_IN' | 'NOT_CHECKED_IN' | 'WINNER' | 'NOT_WINNER';

export interface Request {
   gameId: string;
   page?: number;
   pageSize?: number;
   search?: string;
   filter?: Filter;
}

export interface Response {
   attendants: AdminWeb.Database.GameLuckyDrawAttendant[];
   totalCount: number;
}

export type Service = (request: Request) => AdminWeb.Utilities.Trycatch.ResultAsync<Response>;
