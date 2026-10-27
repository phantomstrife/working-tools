export interface StaffMember {
   id: string;
   accountId: string;
   assigned_at: string | null;
   full_name: string;
   email: string;
   phone: string | null;
   role: AdminWeb.Database.Account_Role;
   is_active: boolean;
}

export interface Request {
   gameId: string;
   page?: number;
   pageSize?: number;
   search?: string;
   filter?: Filter;
}

export interface Response {
   staff: StaffMember[];
   totalCount: number;
}

export interface JoinedAccount {
   id: string;
   full_name: string;
   email: string;
   phone: string | null;
   role: AdminWeb.Database.Account_Role;
   is_active: boolean | null;
}

export interface GameAccountRow {
   id: string;
   account_id: string;
   assigned_at: string | null;
   account: JoinedAccount | JoinedAccount[] | null;
}

export type Filter = AdminWeb.Features.GameLuckyDraw.Staff.Filter;
export type Service = (request: Request) => AdminWeb.Utilities.Trycatch.ResultAsync<Response>;

