export type Response = AdminWeb.Store.Session.Account;

export type Service = () => AdminWeb.Utilities.Trycatch.ResultAsync<Response>;

