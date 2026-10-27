import { z } from 'zod';

export const assignSchema = z.object({
   accountId: z.string().trim().min(1, 'Vui lòng chọn một nhân viên để phân công.'),
});

export const editSchema = z.object({
   full_name: z.string().trim().min(2, 'Họ và tên phải có ít nhất 2 ký tự.'),
   phone: z.string().trim().optional().or(z.literal('')).nullable(),
   role: z.enum(['FIELD_STAFF', 'GUARD']),
   status: z.enum(['ACTIVE', 'INACTIVE']),
});

