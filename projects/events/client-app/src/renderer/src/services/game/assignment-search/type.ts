export type Assigned_Event = ClientApp.Features.Game.AssignedEvent;

export interface Request {
   accountId: string;
   role: ClientApp.Database.Account_Role;
   gameType?: ClientApp.Database.Game_Type;
}

export interface Game_Row {
   id: string;
   name: string;
   status: ClientApp.Database.Game_Status;
   game_type: ClientApp.Database.Game_Type;
   config: ClientApp.Database.Game['config'];
   is_dev_only: boolean | null;
   event: Omit<Assigned_Event, 'games'> | Omit<Assigned_Event, 'games'>[] | null;
}

export type Response = Assigned_Event[];

export type Service = (request: Request) => ClientApp.Utilities.Trycatch.ResultAsync<Response>;
