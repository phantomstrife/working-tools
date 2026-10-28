export type Status = AdminWeb.Store.Session.Status;
export type Account = AdminWeb.Store.Session.Account;
export type Assigned_Event = AdminWeb.Features.Game.AssignedEvent;
export type Assigned_Game = AdminWeb.Features.Game.AssignedGame;

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

