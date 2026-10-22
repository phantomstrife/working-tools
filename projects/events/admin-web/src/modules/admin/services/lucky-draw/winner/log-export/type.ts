export type Request = {
   gameId?: string | null;
   exportedCount: number;
};

export type Response = {
   success: boolean;
};

export type LogExport = (request: Request) => Promise<Response>;

