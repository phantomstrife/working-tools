export interface Properties {
   events: Events;
   onChooseGame?: (game: Game | null) => void;
}

export interface State {
   events: Events;
   eventId: string;
   gameId: string;
   targetEvent: Event | null;
   targetGame: Game | null;
   isDeletingEvent: boolean;
   isDeletingGame: boolean;
}

export type Event = AdminWeb.Database.EventWithGames;
export type Events = Event[];
export type Game = AdminWeb.Database.Game;

export type Handle_Select_Change = (event: React.ChangeEvent<HTMLSelectElement>) => void;
