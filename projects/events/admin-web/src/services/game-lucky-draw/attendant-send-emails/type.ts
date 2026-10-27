import type { Provider_Type } from '@admin-web/adapters/email/type';

export interface Request {
   gameId: string;
   attendantIds: string[];
}

export interface Response {
   provider: Provider_Type;
   totalRequested: number;
   sentCount: number;
   failedCount: number;
}

export interface TemplateContext {
   fullName: string;
   ticketCode: string;
   qrCodePayload: string;
   eventName: string;
   gameName: string;
   locationName: string | null;
   startTime: string | null;
}

export type Service = (request: Request) => AdminWeb.Utilities.Trycatch.ResultAsync<Response>;

