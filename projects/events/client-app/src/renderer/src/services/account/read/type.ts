export type Response = ClientApp.Store.Session.Account;

export type Service = () => ClientApp.Utilities.Trycatch.ResultAsync<Response>;
