export type Assigned_Event = ClientApp.Features.Game.AssignedEvent;

export interface Request {
   accountId: string;
   role: ClientApp.Database.Account_Role;
   gameType: ClientApp.Database.Instance['public']['Enums']['game_type'];
}

export interface Game_Row {
   id: string;
   name: string;
   status: ClientApp.Database.Game_Status;
   game_type: Request['gameType'];
   is_dev_only: boolean | null;
   event: Omit<Assigned_Event, 'games'> | Omit<Assigned_Event, 'games'>[] | null;
}

export type Response = Assigned_Event[];

export type Service = (request: Request) => ClientApp.Utilities.Trycatch.ResultAsync<Response>;
