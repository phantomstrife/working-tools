export interface Request {
   // Only honored for SUPER_ADMIN; other roles are always scoped to their own company.
   companyId?: string;
}

export interface Response {
   event: Event[];
}

export type Event = AdminWeb.Database.EventWithGames;
export type Service = (request?: Request) => AdminWeb.Utilities.Trycatch.ResultAsync<Response>;
