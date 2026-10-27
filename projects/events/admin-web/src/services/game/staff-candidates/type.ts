export interface CandidateAccount {
   id: string;
   full_name: string;
   email: string;
   phone: string | null;
   role: AdminWeb.Database.Account_Role;
   is_active: boolean;
}

export interface Request {
   gameId: string;
}

export interface Response {
   candidates: CandidateAccount[];
}

export type Service = (request: Request) => AdminWeb.Utilities.Trycatch.ResultAsync<Response>;

