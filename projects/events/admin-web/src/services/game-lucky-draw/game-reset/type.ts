export interface Request {
   gameId: string;
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
