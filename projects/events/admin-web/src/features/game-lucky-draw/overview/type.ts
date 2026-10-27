import type * as AttendantsDatatableTypes from '@admin-web/features/game-lucky-draw/attendants-datatable/type';
import type * as PrizePanelTypes from '@admin-web/features/game-lucky-draw/prize-panel/type';
import type * as StaffPanelTypes from '@admin-web/features/game-lucky-draw/staff-panel/type';

export interface Properties {
   game: Game;
}

export interface State {
   loading: boolean;
   prizeCount: number;
   staffCount: number;
}

export interface PanelRefs {
   attendants: React.RefObject<AttendantsDatatableHandle | null>;
   prizes: React.RefObject<PrizePanelHandle | null>;
   staff: React.RefObject<StaffPanelHandle | null>;
}

export type Game = AdminWeb.Database.Game;
export type GameLuckyDrawPrize = AdminWeb.Database.GameLuckyDrawPrize;
export type AttendantsDatatableHandle = AttendantsDatatableTypes.ImperativeHandle;
export type PrizePanelHandle = PrizePanelTypes.ImperativeHandle;
export type StaffPanelHandle = StaffPanelTypes.ImperativeHandle;
