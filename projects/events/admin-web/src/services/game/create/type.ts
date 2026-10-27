export interface Request {
   id?: string;
   eventId: string;
   name: string;
   game_type: AdminWeb.Database.Game_Type;
   status?: AdminWeb.Database.Game_Status | null;
   description?: string | null;
}

export interface Response {
   game: AdminWeb.Database.Game;
}

export type Service = (request: Request) => AdminWeb.Utilities.Trycatch.ResultAsync<Response>;
