import type * as AttendantsDatatableTypes from '@admin-web/features/game-lucky-draw/attendants-datatable/type';

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
export type AttendantsDatatableHandle = AttendantsDatatableTypes.ImperativeHandle;
