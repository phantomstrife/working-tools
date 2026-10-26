export interface Properties {
   events: Events;
}

export interface State {
   game: Game | null;
}

export type Events = AdminWeb.Database.EventWithGames[];
export type Game = AdminWeb.Database.Game;
