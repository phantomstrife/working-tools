import { z } from 'zod';

import { SALUTATION_OPTIONS } from '@admin-web/services/game-lucky-draw/attendant-import-csv/constants';

export { SALUTATION_OPTIONS };

export const schema = z.object({
   salutation: z
      .enum(['Anh', 'Chị', 'Ông', 'Bà'], {
         error: 'Danh xưng chỉ chấp nhận Anh, Chị, Ông hoặc Bà.',
      })
      .optional()
      .or(z.literal(''))
      .nullable(),
   full_name: z.string().trim().min(2, 'Họ và tên phải có ít nhất 2 ký tự.'),
   citizen_id: z.string().trim().optional().or(z.literal('')).nullable(),
   ticket_code: z.string().trim().min(1, 'Mã vé không được để trống.'),
   email: z.email('Vui lòng nhập địa chỉ email hợp lệ.').trim().optional().or(z.literal('')).nullable(),
   phone: z.string().trim().optional().or(z.literal('')).nullable(),
   company_name: z.string().trim().optional().or(z.literal('')).nullable(),
   department: z.string().trim().optional().or(z.literal('')).nullable(),
   representative_salutation: z
      .enum(['Anh', 'Chị', 'Ông', 'Bà'], {
         error: 'Danh xưng đại diện chỉ chấp nhận Anh, Chị, Ông hoặc Bà.',
      })
      .optional()
      .or(z.literal(''))
      .nullable(),
   representative: z.string().trim().optional().or(z.literal('')).nullable(),
   representative_phone: z.string().trim().optional().or(z.literal('')).nullable(),
   sale_in_charge: z.string().trim().optional().or(z.literal('')).nullable(),
   accommodation: z.boolean(),
   is_checked_in: z.boolean(),
   is_draw_eligible: z.boolean(),
});
