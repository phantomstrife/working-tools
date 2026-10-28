export type Provider_Type = 'aws' | 'resend';

export interface Email_Message {
   to: string;
   subject: string;
   html: string;
   text?: string;
   from?: string;
   attachments?: {
      filename: string;
      content: string | Buffer;
      cid?: string;
   }[];
}

export interface Send_Result {
   success: boolean;
   messageId?: string;
   error?: string;
}

export interface Email_Service {
   readonly provider: Provider_Type;
   sendEmail: (message: Email_Message) => Promise<Send_Result>;
   sendBatchEmails: (messages: Email_Message[]) => Promise<Send_Result[]>;
}

export type Get_Email_Service = () => Email_Service;
