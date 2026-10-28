export type Draw_Mode = AdminWeb.Features.GameLuckyDraw.DrawMode;
export type Prize = AdminWeb.Features.GameLuckyDraw.Prize;
export type Participant = AdminWeb.Features.GameLuckyDraw.Participant;
export type Winner_Entry = AdminWeb.Features.GameLuckyDraw.WinnerEntry;
export type Notice = AdminWeb.Features.GameLuckyDraw.Notice;

export type Set_Boolean_Or_Updater = boolean | ((previous: boolean) => boolean);

export interface Store {
   gameId: string;
   prizes: Prize[];
   participants: Participant[];
   winners: Winner_Entry[];
   forfeitedAttendantIds: string[];
   currentPrizeIndex: number;
   winnerId: string;
   activeWinnerId: string | null;
   activeWinnerRecordId: string | null;
   isSpinning: boolean;
   isDrawingRequest: boolean;
   isLoadingGame: boolean;
   isRealtimeConnected: boolean;
   stoppedReels: number;
   drawMode: Draw_Mode;
   showWinners: boolean;
   hideHud: boolean;
   notice: Notice | null;
   loadGameData: (gameId: string) => Promise<void>;
   cleanupRealtime: () => void;
   setCurrentPrize: (index: number) => void;
   setDrawMode: (mode: Draw_Mode) => void;
   setShowWinners: (value: Set_Boolean_Or_Updater) => void;
   setHideHud: (value: Set_Boolean_Or_Updater) => void;
   setNotice: (notice: Notice | null) => void;
   clearNotice: () => void;
   startDraw: () => Promise<void>;
   handleManualStop: () => void;
   redrawAbsentWinner: () => Promise<void>;
}

