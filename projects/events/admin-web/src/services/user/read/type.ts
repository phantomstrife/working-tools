export interface Response {
   role: Account_Role;
   companyId: string;
}

export type Account_Role = AdminWeb.Database.Account_Role;
export type Service = () => AdminWeb.Utilities.Trycatch.ResultAsync<Response>;
