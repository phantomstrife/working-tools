import { z } from 'zod';

export const schema = z
   .object({
      name: z.string().trim().min(2, 'Tên giải thưởng phải có ít nhất 2 ký tự.'),
      tier_order: z
         .number({ error: 'Vui lòng nhập hạng giải hợp lệ.' })
         .int('Hạng giải phải là số nguyên.')
         .min(1, 'Hạng giải phải lớn hơn hoặc bằng 1.'),
      total_quantity: z
         .number({ error: 'Vui lòng nhập tổng số lượng hợp lệ.' })
         .int('Số lượng phải là số nguyên.')
         .min(1, 'Tổng số lượng phải ít nhất là 1.'),
      remaining_quantity: z
         .number({ error: 'Vui lòng nhập số lượng còn lại hợp lệ.' })
         .int('Số lượng phải là số nguyên.')
         .min(0, 'Số lượng còn lại không được âm.'),
      image_url: z.url('Vui lòng nhập đường dẫn hình ảnh hợp lệ.').trim().optional().or(z.literal('')).nullable(),
      description: z.string().trim().optional().or(z.literal('')).nullable(),
   })
   .refine((values) => values.remaining_quantity <= values.total_quantity, {
      message: 'Số lượng còn lại không được vượt quá tổng số lượng.',
      path: ['remaining_quantity'],
   });

