import type { Provider_Type } from '@admin-web/adapters/email/type';

export interface Request {
   gameId: string;
   attendantIds?: string[];
   sendAll?: boolean;
}

export interface Response {
   provider: Provider_Type;
   totalRequested: number;
   sentCount: number;
   failedCount: number;
}

export interface TemplateContext {
   salutation?: string | null;
   fullName: string;
   citizenId?: string | null;
   email?: string | null;
   phone?: string | null;
   ticketCode: string;
   qrCodePayload: string;
   eventName: string;
   gameName: string;
   locationName: string | null;
   startTime: string | null;
   isVip?: boolean;
   confirmUrl?: string;
   editUrl?: string;
}

export type Service = (request: Request) => AdminWeb.Utilities.Trycatch.ResultAsync<Response>;

