export interface Request extends Omit<Company, 'created_at' | 'updated_at'> {
   //
}

export interface Response {
   company: Company;
}

export type Company = AdminWeb.Database.Company;
export type Service = (request: Request) => AdminWeb.Utilities.Trycatch.ResultAsync<Response>;
