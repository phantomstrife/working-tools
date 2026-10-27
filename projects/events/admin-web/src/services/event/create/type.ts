export interface Request {
   id?: string;
   companyId?: string;
   name: string;
   slug: string;
   status?: AdminWeb.Database.Event_Status | null;
   start_time?: string | null;
   end_time?: string | null;
   location_name?: string | null;
   location_address?: string | null;
   banner_url?: string | null;
   description?: string | null;
}

export interface Response {
   event: AdminWeb.Database.EventWithGames;
}

export type Service = (request: Request) => AdminWeb.Utilities.Trycatch.ResultAsync<Response>;
