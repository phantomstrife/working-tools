export interface Request extends Omit<AdminWeb.Database.Company, 'created_at' | 'updated_at'> {
   //
}

export interface Response {
   company: AdminWeb.Database.Company;
}

export type Service = (request: Request) => AdminWeb.Utilities.Trycatch.ResultAsync<Response>;
