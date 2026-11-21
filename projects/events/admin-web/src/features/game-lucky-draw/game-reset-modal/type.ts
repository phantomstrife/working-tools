export type Game = AdminWeb.Database.Game;

export interface Properties {
   game: Game;
   onSuccess?: () => void | Promise<void>;
}

export interface State {
   resetCheckIns: boolean;
   deleteAttendants: boolean;
}
