export interface Request {
   id: string;
}

export interface Response {
   accounts: GameAccount[];
}

export type GameAccount = AdminWeb.Database.GameAccount;
export type Service = (request: Request) => AdminWeb.Utilities.Trycatch.ResultAsync<Response>;
