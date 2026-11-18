export type AttendantHistoryActionType =
   | 'ATTENDANT_GUARD_EDIT'
   | 'ATTENDANT_SELF_SERVICE_CONFIRM'
   | 'ATTENDANT_SELF_SERVICE_UPDATE';

export interface FieldChange {
   field: string;
   from: string | null;
   to: string | null;
}

export interface AttendantHistoryEntry {
   id: string;
   actionType: AttendantHistoryActionType;
   source: string | null;
   actorName: string | null;
   actorEmail: string | null;
   createdAt: string | null;
   changes: FieldChange[];
}

export interface Request {
   gameId: string;
   attendantId: string;
}

export interface Response {
   entries: AttendantHistoryEntry[];
}

export type Service = (request: Request) => AdminWeb.Utilities.Trycatch.ResultAsync<Response>;
