export interface Properties {
   events: Events;
   role?: Account_Role | null;
   isSuperAdmin?: boolean;
}

export interface State {
   game: Game | null;
}

export type Account_Role = AdminWeb.Database.Account_Role;
export type Events = AdminWeb.Database.EventWithGames[];
export type Game = AdminWeb.Database.Game;
