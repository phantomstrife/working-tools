export type Request = {
   email: string;
   password: string;
};

export type Response = {
   accountRole: AdminWeb.Database.Account_Role;
   companyId: string | null;
};

export type Login = (request: Request) => AdminWeb.Utilities.Trycatch.ResultAsync<Response>;
