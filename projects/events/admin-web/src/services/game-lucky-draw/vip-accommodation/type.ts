export interface VipAttendantInfo {
   id: string;
   salutation: string | null;
   full_name: string;
   citizen_id: string | null;
   email: string | null;
   phone: string | null;
   ticket_code: string;
   eventName: string;
   gameName: string;
   locationName: string | null;
   startTime: string | null;
   accommodationConfirmed: boolean;
   isEditExpired: boolean;
}

export interface ReadRequest {
   token: string;
}

export interface ConfirmRequest {
   token: string;
}

export interface UpdateRequest {
   token: string;
   salutation?: AdminWeb.Features.GameLuckyDraw.Attendant.Salutation | null;
   full_name: string;
   citizen_id?: string | null;
   email?: string | null;
   phone?: string | null;
}

export interface Response {
   attendant: VipAttendantInfo;
}

export type ReadService = (request: ReadRequest) => AdminWeb.Utilities.Trycatch.ResultAsync<Response>;
export type ConfirmService = (request: ConfirmRequest) => AdminWeb.Utilities.Trycatch.ResultAsync<Response>;
export type UpdateService = (request: UpdateRequest) => AdminWeb.Utilities.Trycatch.ResultAsync<Response>;
