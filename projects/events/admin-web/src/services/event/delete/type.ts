export interface Request {
   id: string;
}

export interface Response {
   deletedId: string;
}

export type Service = (request: Request) => AdminWeb.Utilities.Trycatch.ResultAsync<Response>;

