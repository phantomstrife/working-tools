export interface AssignRequest {
   mode: 'assign';
   gameId: string;
   accountId: string;
}

export interface EditRequest {
   mode: 'edit';
   gameId: string;
   assignmentId: string;
   accountId: string;
   full_name: string;
   phone?: string | null;
   role: 'FIELD_STAFF' | 'GUARD';
   is_active: boolean;
}

export type Request = AssignRequest | EditRequest;

export interface Response {
   assignmentId: string;
}

export type Service = (request: Request) => AdminWeb.Utilities.Trycatch.ResultAsync<Response>;

