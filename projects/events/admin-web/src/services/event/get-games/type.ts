export interface Response {
   event: Event[];
}

export type Event = AdminWeb.Database.EventWithGames;
export type Service = () => AdminWeb.Utilities.Trycatch.ResultAsync<Response>;
