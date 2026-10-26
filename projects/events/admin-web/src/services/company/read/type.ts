export interface Request {
   id: string;
}

export interface Response {
   company: AdminWeb.Database.Company;
}

export type Service = (request: Request) => AdminWeb.Utilities.Trycatch.ResultAsync<Response>;
