export interface Request {
   assignmentId: string;
   gameId: string;
}

export interface Response {
   unassignedId: string;
}

export type Service = (request: Request) => AdminWeb.Utilities.Trycatch.ResultAsync<Response>;

