export interface Request {
   id: string;
}

export type DeleteById = (request: Request) => Promise<void>;
