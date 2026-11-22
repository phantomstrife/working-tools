export type Reset_Mode = 'GAME_DATA_ONLY' | 'CUSTOM';

export interface Request {
   gameId: string;
   mode?: Reset_Mode;
   resetCheckIns?: boolean;
   deleteAttendants?: boolean;
}

export interface Response {
   deletedWinners: number;
   resetPrizes: number;
   resetAttendants: number;
   deletedAttendants: number;
}

export type Service = (request: Request) => AdminWeb.Utilities.Trycatch.ResultAsync<Response>;
