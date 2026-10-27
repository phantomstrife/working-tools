export interface Request {
   path: string;
   body?: ClientApp.Object;
}

export type Response<T> = { error: false; data: T } | { error: true; message: string };

export type Request_Admin_Api = <T>(request: Request) => Promise<T>;
