import type { User } from '@supabase/supabase-js';

export type Request = {
   email: string;
   password: string;
};

export type Response = {
   user: User;
   accountRole: Account_Role;
   companyId: string | null;
};

export type Account_Role = AdminWeb.Database.Account_Role;
export type Login = (request: Request) => AdminWeb.Utilities.Trycatch.ResultAsync<Response>;
