export interface Properties {
   events: Events;
   onChooseGame?: (game: Game) => void;
}

export interface State {
   eventId: string;
   gameId: string;
}

export type Events = AdminWeb.Database.EventWithGames[];
export type Game = AdminWeb.Database.Game;

export type Handle_Select_Change = (event: React.ChangeEvent<HTMLSelectElement>) => void;
