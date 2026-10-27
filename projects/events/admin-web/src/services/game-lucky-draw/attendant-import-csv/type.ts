export interface Request {
   gameId: string;
   csvContent: string;
}

export interface RowError {
   row: number;
   ticket_code?: string;
   reason: string;
}

export interface Response {
   totalRows: number;
   insertedCount: number;
   updatedCount: number;
   skippedCount: number;
   errors: RowError[];
}

export type Service = (request: Request) => AdminWeb.Utilities.Trycatch.ResultAsync<Response>;

