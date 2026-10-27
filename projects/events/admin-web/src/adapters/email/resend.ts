import { Resend } from 'resend';

import { EMAIL_CONFIG } from './constants';

import type * as Types from './type';

const getResendClient = (): Resend => {
   const apiKey = process.env.RESEND_API_KEY || EMAIL_CONFIG.RESEND_API_KEY;

   if (!apiKey) {
      throw new Error('Missing RESEND_API_KEY environment variable.');
   }

   return new Resend(apiKey);
};

const sendSingleWithResend = async (client: Resend, message: Types.Email_Message): Promise<Types.Send_Result> => {
   try {
      const response = await client.emails.send({
         from: message.from || process.env.EMAIL_FROM || EMAIL_CONFIG.FROM_DEFAULT,
         to: message.to,
         subject: message.subject,
         html: message.html,
         ...(message.text ? { text: message.text } : {}),
      });

      if (response.error) {
         return {
            success: false,
            error: response.error.message,
         };
      }

      return {
         success: true,
         messageId: response.data?.id,
      };
   } catch (error) {
      return {
         success: false,
         error: error instanceof Error ? error.message : String(error),
      };
   }
};

export const createResendEmailService = (): Types.Email_Service => {
   return {
      provider: 'resend',

      async sendEmail(message) {
         const client = getResendClient();
         return sendSingleWithResend(client, message);
      },

      async sendBatchEmails(messages) {
         if (messages.length === 0) {
            return [];
         }

         const client = getResendClient();
         const results: Types.Send_Result[] = [];
         const defaultFrom = process.env.EMAIL_FROM || EMAIL_CONFIG.FROM_DEFAULT;

         for (let offset = 0; offset < messages.length; offset += EMAIL_CONFIG.RESEND_BATCH_SIZE) {
            const chunk = messages.slice(offset, offset + EMAIL_CONFIG.RESEND_BATCH_SIZE);

            try {
               const batchPayload = chunk.map((msg) => ({
                  from: msg.from || defaultFrom,
                  to: msg.to,
                  subject: msg.subject,
                  html: msg.html,
                  ...(msg.text ? { text: msg.text } : {}),
               }));

               const batchResponse = await client.batch.send(batchPayload);

               if (!batchResponse.error && batchResponse.data?.data) {
                  const batchItems = batchResponse.data.data;

                  chunk.forEach((_, idx) => {
                     const item = batchItems[idx];
                     results.push({
                        success: Boolean(item?.id),
                        messageId: item?.id,
                        error: item?.id ? undefined : 'Failed to dispatch email in Resend batch.',
                     });
                  });
                  continue;
               }
            } catch {
               // Fallback to per-recipient dispatch so one invalid address does not fail the entire chunk
            }

            for (let i = 0; i < chunk.length; i += EMAIL_CONFIG.CONCURRENCY_LIMIT) {
               const subChunk = chunk.slice(i, i + EMAIL_CONFIG.CONCURRENCY_LIMIT);
               const subResults = await Promise.all(subChunk.map((msg) => sendSingleWithResend(client, msg)));
               results.push(...subResults);
            }
         }

         return results;
      },
   };
};

