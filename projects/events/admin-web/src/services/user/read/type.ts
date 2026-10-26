export interface Response {
   role: AdminWeb.Database.Account_Role;
   companyId: string;
}

export type Service = () => AdminWeb.Utilities.Trycatch.ResultAsync<Response>;
