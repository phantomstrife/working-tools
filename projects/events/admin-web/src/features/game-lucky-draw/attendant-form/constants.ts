import { z } from 'zod';

export const schema = z.object({
   full_name: z.string().trim().min(2, 'Họ và tên phải có ít nhất 2 ký tự.'),
   ticket_code: z.string().trim().min(1, 'Mã vé không được để trống.'),
   email: z.email('Vui lòng nhập địa chỉ email hợp lệ.').trim().optional().or(z.literal('')).nullable(),
   phone: z.string().trim().optional().or(z.literal('')).nullable(),
   company_name: z.string().trim().optional().or(z.literal('')).nullable(),
   department: z.string().trim().optional().or(z.literal('')).nullable(),
});

