import { Resend } from 'resend';

const resendAPIKey = process.env.RESEND_API_KEY!;
const siteUrl = process.env.SITE_URL!;

export const redirectUrl = siteUrl;
export const resend = new Resend(resendAPIKey);
