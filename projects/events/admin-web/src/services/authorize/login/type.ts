export type Request = {
   email: string;
   password: string;
};

export type Response = {
   accountRole: Database.Role;
   companyId: string | null;
};

export type Login = (request: Request) => Promise<Response>;
