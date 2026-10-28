import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';
import nodemailer from 'nodemailer';
import { EMAIL_CONFIG } from './constants';
import type * as Types from './type';

const getSesClient = (): SESv2Client => {
   const region = process.env.AWS_REGION || process.env.AWS_SES_REGION || EMAIL_CONFIG.AWS_REGION;
   const accessKeyId = process.env.AWS_ACCESS_KEY_ID || EMAIL_CONFIG.AWS_ACCESS_KEY_ID;
   const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || EMAIL_CONFIG.AWS_SECRET_ACCESS_KEY;

   if (!accessKeyId || !secretAccessKey) {
      throw new Error('Missing AWS_ACCESS_KEY_ID or AWS_SECRET_ACCESS_KEY environment variables for AWS SES.');
   }

   return new SESv2Client({
      region,
      credentials: {
         accessKeyId,
         secretAccessKey,
      },
   });
};

const sendSingleWithSes = async (client: SESv2Client, message: Types.Email_Message): Promise<Types.Send_Result> => {
   try {
      // Truyền toàn bộ module awsSesV2 để vượt qua vòng kiểm tra type của Nodemailer
      const transporter = nodemailer.createTransport({
         SES: {
            sesClient: client,
            SendEmailCommand,
         },
      });

      const response = await transporter.sendMail({
         from: message.from || process.env.EMAIL_FROM || EMAIL_CONFIG.FROM_DEFAULT,
         to: message.to,
         subject: message.subject,
         html: message.html,
         text: message.text,
         attachments: message.attachments, // QR code buffer/base64 nằm ở đây
      });

      return {
         success: true,
         messageId: response.messageId,
      };
   } catch (error) {
      return {
         success: false,
         error: error instanceof Error ? error.message : String(error),
      };
   }
};

export const createAwsSesEmailService = (): Types.Email_Service => {
   return {
      provider: 'aws',
      async sendEmail(message) {
         const client = getSesClient();
         return sendSingleWithSes(client, message);
      },
      async sendBatchEmails(messages) {
         if (messages.length === 0) return [];

         const client = getSesClient();
         const results: Types.Send_Result[] = [];

         for (let offset = 0; offset < messages.length; offset += EMAIL_CONFIG.CONCURRENCY_LIMIT) {
            const chunk = messages.slice(offset, offset + EMAIL_CONFIG.CONCURRENCY_LIMIT);
            const chunkResults = await Promise.all(chunk.map((msg) => sendSingleWithSes(client, msg)));
            results.push(...chunkResults);
         }
         return results;
      },
   };
};
