import { z } from 'zod';

export const EVENT_STATUS_OPTIONS: AdminWeb.Database.Event_Status[] = [
   'UPCOMING',
   'DRAFT',
   'ONGOING',
   'COMPLETED',
   'CANCELLED',
];

export const toSlug = (value: string): string => {
   return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'd')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
};

export const schema = z.object({
   name: z.string().trim().min(2, 'Tên sự kiện phải có ít nhất 2 ký tự.'),
   slug: z
      .string()
      .trim()
      .min(2, 'Đường dẫn (slug) phải có ít nhất 2 ký tự.')
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug chỉ gồm chữ thường, số và dấu gạch ngang (-).'),
   status: z.enum(['DRAFT', 'UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED']),
   start_time: z.string().trim().optional().or(z.literal('')).nullable(),
   end_time: z.string().trim().optional().or(z.literal('')).nullable(),
   location_name: z.string().trim().optional().or(z.literal('')).nullable(),
   location_address: z.string().trim().optional().or(z.literal('')).nullable(),
   banner_url: z.url('Vui lòng nhập đường dẫn hình ảnh hợp lệ.').trim().optional().or(z.literal('')).nullable(),
   description: z.string().trim().optional().or(z.literal('')).nullable(),
});

