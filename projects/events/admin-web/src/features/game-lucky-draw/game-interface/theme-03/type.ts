import type { Column_State as Slot_Reel_Column_State } from '@admin-web/features/game-lucky-draw/game-interface/slot-reel-01/type';

export type Prize = AdminWeb.Features.GameLuckyDraw.Prize;
export type Participant = AdminWeb.Features.GameLuckyDraw.Participant;
export type Winner_Entry = AdminWeb.Features.GameLuckyDraw.WinnerEntry;

export type Stage_Status_Key =
   | 'standby_status'
   | 'drawing_status'
   | 'winner_status'
   | 'select_prize_status'
   | 'prize_exhausted_status';

export type Reel_Column_State = Slot_Reel_Column_State;

export interface Winner_Card_Data {
   ticketCode: string;
   companyName: string;
   displayName: string;
   displayPhone: string;
   isCompactName: boolean;
}
