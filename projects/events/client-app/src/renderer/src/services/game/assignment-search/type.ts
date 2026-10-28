export type Assigned_Event = ClientApp.Features.Game.AssignedEvent;

export interface Request {
   accountId: string;
   role: ClientApp.Database.Account_Role;
   companyId: string | null;
   gameType?: ClientApp.Database.Game_Type;
}

export interface Event_Row extends Omit<Assigned_Event, 'games'> {
   company_id: string;
}

export interface Game_Row {
   id: string;
   name: string;
   status: ClientApp.Database.Game_Status;
   game_type: ClientApp.Database.Game_Type;
   config: ClientApp.Database.Game['config'];
   is_dev_only: boolean | null;
   event: Event_Row | Event_Row[] | null;
}

export interface Assignment_Row {
   event_id: string;
   game: Game_Row | Game_Row[] | null;
}

export type Response = Assigned_Event[];

export type Service = (request: Request) => ClientApp.Utilities.Trycatch.ResultAsync<Response>;
