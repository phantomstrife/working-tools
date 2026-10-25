export interface Request {
   id: string;
}

export interface Response extends Company {
   //
}

export type Service = (request: Request) => HttpRequest.Result<Response>;
