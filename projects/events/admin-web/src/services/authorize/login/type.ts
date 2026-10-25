type AccountRole = Database['public']['Enums']['account_role'];

export type Request = {
   email: string;
   password: string;
};

export type Response = {
   accountRole: AccountRole;
   companyId: string | null;
};

export type Login = (request: Request) => Promise<Response>;
