import { z } from 'zod';

export const schema = z.object({
   full_name: z.string().trim().min(2, 'Họ và tên phải có ít nhất 2 ký tự.'),
   citizen_id: z.string().trim().optional().or(z.literal('')).nullable(),
   email: z.email('Vui lòng nhập địa chỉ email hợp lệ.').trim().optional().or(z.literal('')).nullable(),
   phone: z.string().trim().optional().or(z.literal('')).nullable(),
});
