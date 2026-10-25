export type Request = {
   gameId: string;
   eventId: string;
   accountIds: string[];
};

export type Response = {
   assignedCount: number;
};

export type AssignGameStaff = (request: Request) => Promise<Response>;

