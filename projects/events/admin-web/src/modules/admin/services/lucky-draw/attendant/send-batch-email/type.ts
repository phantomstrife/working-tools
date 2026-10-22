export type Request = {
   attendantIds: string[];
};

export type Response = {
   sentCount: number;
   skippedCount: number;
   failedCount: number;
};

export type SendBatchEmail = (request: Request) => Promise<Response>;

