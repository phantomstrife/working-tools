import { createAwsSesEmailService } from './aws-ses';
import { EMAIL_CONFIG } from './constants';
import { createResendEmailService } from './resend';

import type * as Types from './type';

export const getEmailService: Types.Get_Email_Service = () => {
   const provider = (process.env.EMAIL_PROVIDER ?? EMAIL_CONFIG.PROVIDER).trim().toLowerCase();

   if (provider === 'aws') {
      return createAwsSesEmailService();
   }

   if (provider === 'resend') {
      return createResendEmailService();
   }

   throw new Error(`Unsupported EMAIL_PROVIDER "${provider}". Expected "aws" or "resend".`);
};

