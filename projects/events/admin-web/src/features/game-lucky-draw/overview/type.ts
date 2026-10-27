export interface Properties {
   game: Game;
}

export interface State {
   loading: boolean;
   prizeCount: number;
   staffCount: number;
}

export type Game = AdminWeb.Database.Game;
export type GameLuckyDrawPrize = AdminWeb.Database.GameLuckyDrawPrize;
