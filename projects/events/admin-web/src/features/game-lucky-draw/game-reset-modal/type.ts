export type Account_Role = AdminWeb.Database.Account_Role;
export type Game = AdminWeb.Database.Game;

export interface Properties {
   game: Game;
   role?: Account_Role | null;
   onSuccess?: () => void | Promise<void>;
}

export interface State {
   resetCheckIns: boolean;
   deleteAttendants: boolean;
}
