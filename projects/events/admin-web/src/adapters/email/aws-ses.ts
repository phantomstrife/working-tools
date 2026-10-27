import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

import { EMAIL_CONFIG } from './constants';

import type * as Types from './type';

const getSesClient = (): SESClient => {
   const region = process.env.AWS_REGION || process.env.AWS_SES_REGION || EMAIL_CONFIG.AWS_REGION;
   const accessKeyId = process.env.AWS_ACCESS_KEY_ID || EMAIL_CONFIG.AWS_ACCESS_KEY_ID;
   const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || EMAIL_CONFIG.AWS_SECRET_ACCESS_KEY;

   if (!accessKeyId || !secretAccessKey) {
      throw new Error('Missing AWS_ACCESS_KEY_ID or AWS_SECRET_ACCESS_KEY environment variables for AWS SES.');
   }

   return new SESClient({
      region,
      credentials: {
         accessKeyId,
         secretAccessKey,
      },
   });
};

const sendSingleWithSes = async (client: SESClient, message: Types.Email_Message): Promise<Types.Send_Result> => {
   try {
      const command = new SendEmailCommand({
         Source: message.from || process.env.EMAIL_FROM || EMAIL_CONFIG.FROM_DEFAULT,
         Destination: {
            ToAddresses: [message.to],
         },
         Message: {
            Subject: {
               Data: message.subject,
               Charset: 'UTF-8',
            },
            Body: {
               Html: {
                  Data: message.html,
                  Charset: 'UTF-8',
               },
               ...(message.text
                  ? {
                       Text: {
                          Data: message.text,
                          Charset: 'UTF-8',
                       },
                    }
                  : {}),
            },
         },
      });

      const response = await client.send(command);

      return {
         success: true,
         messageId: response.MessageId,
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
         if (messages.length === 0) {
            return [];
         }

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

