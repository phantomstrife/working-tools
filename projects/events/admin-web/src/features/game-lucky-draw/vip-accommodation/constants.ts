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
   email: z.email('Vui lòng nhập địa chỉ email hợp lệ.').trim().optional().or(z.literal('')).nullable(),
   phone: z.string().trim().optional().or(z.literal('')).nullable(),
});
