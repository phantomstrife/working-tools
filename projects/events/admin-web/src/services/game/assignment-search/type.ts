export type Assigned_Event = AdminWeb.Features.Game.AssignedEvent;

export interface Request {
   accountId: string;
   role: AdminWeb.Database.Account_Role;
   companyId: string | null;
   gameType?: AdminWeb.Database.Game_Type;
}

export interface Event_Row extends Omit<Assigned_Event, 'games'> {
   company_id: string;
}

export interface Game_Row {
   id: string;
   name: string;
   status: AdminWeb.Database.Game_Status;
   game_type: AdminWeb.Database.Game_Type;
   config: AdminWeb.Database.Game['config'];
   is_dev_only: boolean | null;
   event: Event_Row | Event_Row[] | null;
}

export interface Assignment_Row {
   event_id: string;
   game: Game_Row | Game_Row[] | null;
}

export type Response = Assigned_Event[];

export type Service = (request: Request) => AdminWeb.Utilities.Trycatch.ResultAsync<Response>;

