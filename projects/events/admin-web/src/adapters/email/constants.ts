export const EMAIL_CONFIG = {
   PROVIDER: (process.env.EMAIL_PROVIDER ?? 'resend').trim().toLowerCase(),
   FROM_DEFAULT: process.env.EMAIL_FROM ?? 'Event Ecosystem <onboarding@resend.dev>',
   RESEND_API_KEY: process.env.RESEND_API_KEY ?? '',
   AWS_REGION: process.env.AWS_REGION ?? process.env.AWS_SES_REGION ?? 'ap-southeast-1',
   AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID ?? '',
   AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY ?? '',
   RESEND_BATCH_SIZE: 100,
   CONCURRENCY_LIMIT: 10,
} as const;

