export interface Request {
   id: string;
}

export interface Response extends Database.Company {
   //
}

export type Service = (request: Request) => HttpRequest.Result<Response>;
