export type Company = Pick<AdminWeb.Database.Company, 'id' | 'name'>;

export interface Response {
   companies: Company[];
}

export type Service = () => AdminWeb.Utilities.Trycatch.ResultAsync<Response>;
