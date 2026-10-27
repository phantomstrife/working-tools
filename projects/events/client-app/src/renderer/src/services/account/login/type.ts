export interface Request {
   email: string;
   password: string;
}

export type Response = ClientApp.Store.Session.Account;

export type Service = (request: Request) => ClientApp.Utilities.Trycatch.ResultAsync<Response>;
