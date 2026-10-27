export type Status = ClientApp.Store.Session.Status;
export type Account = ClientApp.Store.Session.Account;
export type Assigned_Event = ClientApp.Features.Game.AssignedEvent;
export type Assigned_Game = ClientApp.Features.Game.AssignedGame;

export interface Persisted_Selection {
   eventId: string;
   gameId: string;
}

export interface Store {
   status: Status;
   account: Account | null;
   events: Assigned_Event[];
   selectedEventId: string;
   selectedGameId: string;
   isLoadingAssignments: boolean;
   setAuthenticated: (account: Account) => void;
   setUnauthenticated: () => void;
   setAssignments: (events: Assigned_Event[]) => void;
   setLoadingAssignments: (loading: boolean) => void;
   selectEvent: (eventId: string) => void;
   selectGame: (gameId: string) => void;
}
