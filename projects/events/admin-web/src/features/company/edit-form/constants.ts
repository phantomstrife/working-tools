import { z } from 'zod';

export const schema = z.object({
   name: z.string().trim().min(2, 'Company name must be at least 2 characters.'),
   tax_code: z.string().trim().optional().or(z.literal('')).nullable(),
   industry: z.string().trim().optional().or(z.literal('')).nullable(),
   contact_person: z.string().trim().optional().or(z.literal('')).nullable(),
   contact_email: z.email('Please enter a valid email address.').trim().optional().or(z.literal('')).nullable(),
   contact_phone: z.string().trim().optional().or(z.literal('')).nullable(),
   address: z.string().trim().optional().or(z.literal('')).nullable(),
   logo_url: z.string().trim().optional().or(z.literal('')).nullable(),
   status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).nullable(),
});
