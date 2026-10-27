export interface Request {
   gameId: string;
}

export interface Response {
   total: number;
   checkedIn: number;
}

export type Service = (request: Request) => ClientApp.Utilities.Trycatch.ResultAsync<Response>;
