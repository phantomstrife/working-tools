export type Attendant = AdminWeb.Features.GameLuckyDraw.CheckIn.Attendant;
export type Check_In_Result = AdminWeb.Features.GameLuckyDraw.CheckIn.Result;
export type Qr_Mode = 'SCANNER' | 'CAMERA';
export type Camera_Hud_Status = 'IDLE' | 'VERIFYING' | 'SUCCESS' | 'ALREADY' | 'ERROR';

export interface Properties {
   gameId: string;
}

export interface Recent_Entry {
   attendant: Attendant;
   status: AdminWeb.Features.GameLuckyDraw.CheckIn.Status;
   at: number;
}

export interface State {
   totalCount: number;
   checkedInCount: number;
   isStatsLoading: boolean;
   qrMode: Qr_Mode;
   qrInput: string;
   isQrSubmitting: boolean;
   lastScannedPayload: string;
   isCameraActive: boolean;
   isCameraStarting: boolean;
   cameraError: string;
   searchKeyword: string;
   isSearching: boolean;
   searchResults: Attendant[];
   checkingInAttendantId: string;
   editingAttendant: Attendant | null;
   representativeInput: string;
   isSavingRepresentative: boolean;
   lastResult: Check_In_Result | null;
   recentHistory: Recent_Entry[];
}

