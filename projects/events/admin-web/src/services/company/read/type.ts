export interface Request {
   id: string;
}

export interface Response {
   company: Company;
}

export type Company = AdminWeb.Database.Company;
export type Service = (request: Request) => AdminWeb.Utilities.Trycatch.ResultAsync<Response>;
